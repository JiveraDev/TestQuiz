import pathlib
import re
import zlib


def extract(filename, destination):
  data = pathlib.Path(filename).read_bytes()
  objects = {int(m[1]): m[2] for m in re.finditer(rb'(\d+)\s+\d+\s+obj\b(.*?)endobj', data, re.S)}

  def stream(number):
    body = objects.get(number, b'')
    match = re.search(rb'stream\r?\n(.*?)\r?\nendstream', body, re.S)
    if not match:
      return b''
    raw = match[1]
    try:
      return zlib.decompress(raw) if b'/FlateDecode' in body[:match.start()] else raw
    except zlib.error:
      return b''

  cmaps = {}
  for number, body in objects.items():
    ref = re.search(rb'/ToUnicode\s+(\d+)\s+\d+\s+R', body)
    if not ref:
      continue
    mapping = {}
    cmap = stream(int(ref[1]))
    for block in re.findall(rb'beginbfchar(.*?)endbfchar', cmap, re.S):
      for source, target in re.findall(rb'<([\da-fA-F]+)>\s*<([\da-fA-F]+)>', block):
        mapping[bytes.fromhex(source.decode())] = bytes.fromhex(target.decode()).decode('utf-16-be', errors='replace')
    for block in re.findall(rb'beginbfrange(.*?)endbfrange', cmap, re.S):
      for first, last, target, array in re.findall(rb'<([\da-fA-F]+)>\s*<([\da-fA-F]+)>\s*(?:<([\da-fA-F]+)>|\[(.*?)\])', block, re.S):
        start, end = int(first, 16), int(last, 16)
        if end - start > 65536:
          continue
        values = re.findall(rb'<([\da-fA-F]+)>', array) if array else []
        for index, code in enumerate(range(start, end + 1)):
          value = bytes.fromhex(values[index].decode()) if values else (int(target, 16) + index).to_bytes(len(target) // 2, 'big')
          mapping[code.to_bytes(len(first) // 2, 'big')] = value.decode('utf-16-be', errors='replace')
    cmaps[number] = mapping

  def text(raw, font):
    if raw.startswith(b'<'):
      raw = bytes.fromhex(re.sub(rb'\s', b'', raw[1:-1]).decode())
    else:
      raw = raw[1:-1]
      raw = re.sub(rb'\\([0-7]{1,3}|[\s\S])', lambda m: bytes([int(m[1], 8)]) if re.fullmatch(rb'[0-7]{1,3}', m[1]) else {b'n': b'\n', b'r': b'\r', b't': b'\t'}.get(m[1], m[1]), raw)
    mapping = cmaps.get(font, {})
    if mapping:
      lengths = sorted({len(key) for key in mapping}, reverse=True)
      result = ''
      while raw:
        for size in lengths:
          if raw[:size] in mapping:
            result += mapping[raw[:size]]
            raw = raw[size:]
            break
        else:
          result += raw[:1].decode('cp1252', errors='replace')
          raw = raw[1:]
      return result
    return raw.decode('cp1252', errors='replace')

  page_ids = []
  def walk(number, inherited=b''):
    body = objects.get(number, b'')
    resource = re.search(rb'/Resources\s+(\d+)\s+\d+\s+R', body)
    resources = objects.get(int(resource[1]), b'') if resource else (body if b'/Resources' in body else inherited)
    if re.search(rb'/Type\s*/Page\b', body):
      page_ids.append((number, resources))
    else:
      kids = re.search(rb'/Kids\s*\[(.*?)\]', body, re.S)
      if kids:
        for child in re.findall(rb'(\d+)\s+\d+\s+R', kids[1]):
          walk(int(child), resources)
  for number, body in objects.items():
    if re.search(rb'/Type\s*/Catalog\b', body):
      pages = re.search(rb'/Pages\s+(\d+)\s+\d+\s+R', body)
      if pages:
        walk(int(pages[1]))
        break
  if not page_ids:
    page_ids = [(number, body) for number, body in objects.items() if re.search(rb'/Type\s*/Page\b', body)]

  output = []
  token = re.compile(rb'/([\w-]+)\s+[\d.]+\s+Tf|([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+Tm|(\[(?:[^\[\]]|\([^)]*\))*\])\s*TJ|(<[\da-fA-F\s]+>|\((?:\\.|[^\\)])*\))\s*Tj|/([\w-]+)\s+Do', re.S)
  string_token = re.compile(rb'<[\da-fA-F\s]+>|\((?:\\.|[^\\)])*\)')
  for page_number, (number, resources) in enumerate(page_ids, 1):
    body = objects[number]
    contents = re.search(rb'/Contents\s*(\[.*?\]|\d+\s+\d+\s+R)', body, re.S)
    chunks = []
    def read_content(raw, resources, depth=0):
      if depth > 10:
        return
      font_ref = re.search(rb'/Font\s+(\d+)\s+\d+\s+R', resources)
      font_resources = objects.get(int(font_ref[1]), b'') if font_ref else resources
      fonts = {name: int(ref) for name, ref in re.findall(rb'/([\w-]+)\s+(\d+)\s+\d+\s+R', font_resources)}
      xrefs = {name: int(ref) for name, ref in re.findall(rb'/([\w-]+)\s+(\d+)\s+\d+\s+R', resources)}
      font, y, last_y = None, None, None
      for match in token.finditer(raw):
        if match[1]:
          font = fonts.get(match[1])
        elif match[2]:
          y = round(float(match[7]), 1)
        elif match[10]:
          reference = xrefs.get(match[10])
          resource = objects.get(reference, b'')
          if b'/Subtype /Form' in resource:
            chunks.append('\n')
            read_content(stream(reference), resource, depth + 1)
        else:
          value = ''.join(text(s, font) for s in string_token.findall(match[8] or match[9]))
          if value:
            if last_y is not None and y is not None and abs(y - last_y) > 2:
              chunks.append('\n')
            chunks.append(value)
            last_y = y
    if contents:
      raw = b'\n'.join(stream(int(ref)) for ref in re.findall(rb'(\d+)\s+\d+\s+R', contents[1]))
      read_content(raw, resources)
    output.append(f'\n\n=== PAGE {page_number} ===\n' + ''.join(chunks))
  pathlib.Path(destination).write_text(''.join(output), encoding='utf-8')
  print(pathlib.Path(filename).name, len(page_ids), 'pages;', sum(map(len, output)), 'characters;', destination)


extract(r'C:\Users\loren\Downloads\IT 401 - MIDTERM MODULE - OFFENCES.pdf', '.tools/offences.txt')
extract(r'C:\Users\loren\Downloads\_IT401 MIDTERM L1.pdf', '.tools/lesson1.txt')
