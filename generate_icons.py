"""生成黑屏插件的简单图标 PNG 文件（纯色方块，零依赖）"""
import struct
import zlib
import os

def create_png(width, height, r, g, b):
    """生成纯色 PNG 字节数据"""
    def chunk(chunk_type, data):
        c = chunk_type + data
        crc = struct.pack('>I', zlib.crc32(c) & 0xffffffff)
        return struct.pack('>I', len(data)) + c + crc

    signature = b'\x89PNG\r\n\x1a\n'
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    ihdr = chunk(b'IHDR', ihdr_data)

    raw = b''
    for _ in range(height):
        raw += b'\x00'  # filter none
        for _ in range(width):
            raw += bytes([r, g, b])

    compressed = zlib.compress(raw)
    idat = chunk(b'IDAT', compressed)
    iend = chunk(b'IEND', b'')

    return signature + ihdr + idat + iend


def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    icons_dir = os.path.join(base_dir, 'icons')
    os.makedirs(icons_dir, exist_ok=True)

    sizes = [16, 48, 128]

    # ON 状态：深黑 (#111111)
    for s in sizes:
        path = os.path.join(icons_dir, f'icon-on-{s}.png')
        with open(path, 'wb') as f:
            f.write(create_png(s, s, 0x11, 0x11, 0x11))
        print(f'Created: {path}')

    # OFF 状态：灰色 (#999999)
    for s in sizes:
        path = os.path.join(icons_dir, f'icon-off-{s}.png')
        with open(path, 'wb') as f:
            f.write(create_png(s, s, 0x99, 0x99, 0x99))
        print(f'Created: {path}')

    print('\nAll icons generated!')


if __name__ == '__main__':
    main()
