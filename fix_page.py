#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 查找并替换有问题的代码块
pattern = r'(if \(Array\.isArray\(finalStructure\) \{\s+validatedStructure = finalStructure\.map\(\(item: any\) => \{\s+if \(typeof item === \'string\'\) \{\s+return item\s+\}\s+console\.warn\([^)]+\)\s+return String\(item\)\s+\}\)\s+return \()'

replacement = '''if (Array.isArray(finalStructure)) {
          validatedStructure = finalStructure.map((item: any) => {
            if (typeof item === 'string') {
              return item
            }
            console.warn('Non-string item in structure, converting:', item)
            return String(item)
          }).filter((item: any) => typeof item === 'string')
        } else {
          console.error('CRITICAL: finalStructure is not an array before map!', finalStructure, typeof finalStructure)
        }
        
        // 最终安全检查
        if (!Array.isArray(validatedStructure) || validatedStructure.length === 0) {
          console.error('CRITICAL: validatedStructure is not valid array!', validatedStructure)
          validatedStructure = ["Dear", "Opening", "Body", "Closing", "Regard"]
        }
        
        return ('''

# 使用更灵活的匹配
lines = content.split('\n')
new_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    # 检测问题区域的开始
    if i >= 560 and i <= 570 and 'if (Array.isArray(finalStructure))' in line:
        # 找到问题块，开始替换
        new_lines.append('        if (Array.isArray(finalStructure)) {')
        i += 1
        # 跳过旧的 map 代码
        indent_level = 0
        while i < len(lines) and not lines[i].strip().startswith('return ('):
            current_line = lines[i].strip()
            if 'validatedStructure = finalStructure.map' in current_line:
                new_lines.append('          validatedStructure = finalStructure.map((item: any) => {')
                indent_level = 2
            elif 'if (typeof item ===' in current_line and indent_level == 2:
                new_lines.append('            if (typeof item === \'string\') {')
            elif 'return item' in current_line and indent_level == 2:
                new_lines.append('              return item')
            elif 'console.warn' in current_line and indent_level == 2:
                new_lines.append('            console.warn(\'Non-string item in structure, converting:\', item)')
            elif 'return String(item)' in current_line and indent_level == 2:
                new_lines.append('            return String(item)')
            elif current_line == '})' and indent_level == 2:
                new_lines.append('          }).filter((item: any) => typeof item === \'string\')')
                new_lines.append('        } else {')
                new_lines.append('          console.error(\'CRITICAL: finalStructure is not an array before map!\', finalStructure, typeof finalStructure)')
                new_lines.append('        }')
                new_lines.append('        ')
                new_lines.append('        // 最终安全检查')
                new_lines.append('        if (!Array.isArray(validatedStructure) || validatedStructure.length === 0) {')
                new_lines.append('          console.error(\'CRITICAL: validatedStructure is not valid array!\', validatedStructure)')
                new_lines.append('          validatedStructure = ["Dear", "Opening", "Body", "Closing", "Regard"]')
                new_lines.append('        }')
                new_lines.append('        ')
                indent_level = 0
            else:
                new_lines.append(lines[i])
            i += 1
        # 添加 return (
        if i < len(lines) and 'return (' in lines[i]:
            new_lines.append('        return (')
            i += 1
    else:
        new_lines.append(line)
        i += 1

content = '\n'.join(new_lines)

# 更简单的方法：直接字符串替换
old_code = '''        if (Array.isArray(finalStructure)) {
          validatedStructure = finalStructure.map((item: any) => {
          if (typeof item === 'string') {
            return item
          }
          console.warn('Non-string item in structure, converting:', item)
          return String(item)
        })
        
        return ('''

new_code = '''        if (Array.isArray(finalStructure)) {
          validatedStructure = finalStructure.map((item: any) => {
            if (typeof item === 'string') {
              return item
            }
            console.warn('Non-string item in structure, converting:', item)
            return String(item)
          }).filter((item: any) => typeof item === 'string')
        } else {
          console.error('CRITICAL: finalStructure is not an array before map!', finalStructure, typeof finalStructure)
        }
        
        // 最终安全检查
        if (!Array.isArray(validatedStructure) || validatedStructure.length === 0) {
          console.error('CRITICAL: validatedStructure is not valid array!', validatedStructure)
          validatedStructure = ["Dear", "Opening", "Body", "Closing", "Regard"]
        }
        
        return ('''

if old_code in content:
    content = content.replace(old_code, new_code)
    with open('app/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Fixed successfully!')
else:
    print('Pattern not found, trying alternative...')
    # 尝试更灵活的匹配
    lines = content.split('\n')
    result = []
    i = 0
    fixed = False
    while i < len(lines):
        if i == 561 and 'if (Array.isArray(finalStructure))' in lines[i]:
            fixed = True
            result.append('        if (Array.isArray(finalStructure)) {')
            result.append('          validatedStructure = finalStructure.map((item: any) => {')
            result.append('            if (typeof item === \'string\') {')
            result.append('              return item')
            result.append('            }')
            result.append('            console.warn(\'Non-string item in structure, converting:\', item)')
            result.append('            return String(item)')
            result.append('          }).filter((item: any) => typeof item === \'string\')')
            result.append('        } else {')
            result.append('          console.error(\'CRITICAL: finalStructure is not an array before map!\', finalStructure, typeof finalStructure)')
            result.append('        }')
            result.append('        ')
            result.append('        // 最终安全检查')
            result.append('        if (!Array.isArray(validatedStructure) || validatedStructure.length === 0) {')
            result.append('          console.error(\'CRITICAL: validatedStructure is not valid array!\', validatedStructure)')
            result.append('          validatedStructure = ["Dear", "Opening", "Body", "Closing", "Regard"]')
            result.append('        }')
            result.append('        ')
            # 跳过旧的8行
            i += 9
        else:
            result.append(lines[i])
            i += 1
    
    if fixed:
        with open('app/page.tsx', 'w', encoding='utf-8') as f:
            f.write('\n'.join(result))
        print('Fixed with line-by-line replacement!')
    else:
        print('Could not find the problematic code block')




