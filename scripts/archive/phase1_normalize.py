#!/usr/bin/env python3
"""
Phase 1: Foundation — Data Normalization Script
================================================
1. Re-ID all cards sequentially (1→N)
2. Normalize source names to canonical format
3. Unify answer indexing (JAC 1-based → 0-based)
4. Fix known bugs (typos, dead comments, duplicates)
5. Generate furi (hiragana) for cards missing it
6. Update all cross-references (related_card_id, kartu)

Run from repo root:  python3 scripts/phase1_normalize.py
"""

import re, json, os, sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(REPO, "src", "data")

# ═══════════════════════════════════════════════════════════════════
# ROMAJI → HIRAGANA CONVERTER
# ═══════════════════════════════════════════════════════════════════

ROMAJI_MAP = {
    # Special combinations first (longer patterns match first)
    'sha': 'しゃ', 'shi': 'し', 'sho': 'しょ', 'shu': 'しゅ',
    'cha': 'ちゃ', 'chi': 'ち', 'cho': 'ちょ', 'chu': 'ちゅ',
    'tsu': 'つ', 'tsa': 'つぁ',
    'nya': 'にゃ', 'nyo': 'にょ', 'nyu': 'にゅ',
    'hya': 'ひゃ', 'hyo': 'ひょ', 'hyu': 'ひゅ',
    'mya': 'みゃ', 'myo': 'みょ', 'myu': 'みゅ',
    'rya': 'りゃ', 'ryo': 'りょ', 'ryu': 'りゅ',
    'kya': 'きゃ', 'kyo': 'きょ', 'kyu': 'きゅ',
    'gya': 'ぎゃ', 'gyo': 'ぎょ', 'gyu': 'ぎゅ',
    'bya': 'びゃ', 'byo': 'びょ', 'byu': 'びゅ',
    'pya': 'ぴゃ', 'pyo': 'ぴょ', 'pyu': 'ぴゅ',
    'jya': 'じゃ', 'jyo': 'じょ', 'jyu': 'じゅ',
    'ja': 'じゃ', 'jo': 'じょ', 'ju': 'じゅ', 'ji': 'じ',
    'dya': 'ぢゃ', 'dyo': 'ぢょ', 'dyu': 'ぢゅ',
    'fu': 'ふ',
    'ka': 'か', 'ki': 'き', 'ku': 'く', 'ke': 'け', 'ko': 'こ',
    'sa': 'さ', 'si': 'し', 'su': 'す', 'se': 'せ', 'so': 'そ',
    'ta': 'た', 'ti': 'ち', 'tu': 'つ', 'te': 'て', 'to': 'と',
    'na': 'な', 'ni': 'に', 'nu': 'ぬ', 'ne': 'ね', 'no': 'の',
    'ha': 'は', 'hi': 'ひ', 'hu': 'ふ', 'he': 'へ', 'ho': 'ほ',
    'ma': 'ま', 'mi': 'み', 'mu': 'む', 'me': 'め', 'mo': 'も',
    'ya': 'や', 'yi': 'い', 'yu': 'ゆ', 'ye': 'いぇ', 'yo': 'よ',
    'ra': 'ら', 'ri': 'り', 'ru': 'る', 're': 'れ', 'ro': 'ろ',
    'wa': 'わ', 'wi': 'ゐ', 'we': 'ゑ', 'wo': 'を',
    'ga': 'が', 'gi': 'ぎ', 'gu': 'ぐ', 'ge': 'げ', 'go': 'ご',
    'za': 'ざ', 'zi': 'じ', 'zu': 'ず', 'ze': 'ぜ', 'zo': 'ぞ',
    'da': 'だ', 'di': 'ぢ', 'du': 'づ', 'de': 'で', 'do': 'ど',
    'ba': 'ば', 'bi': 'び', 'bu': 'ぶ', 'be': 'べ', 'bo': 'ぼ',
    'pa': 'ぱ', 'pi': 'ぴ', 'pu': 'ぷ', 'pe': 'ぺ', 'po': 'ぽ',
    'a': 'あ', 'i': 'い', 'u': 'う', 'e': 'え', 'o': 'お',
    'n': 'ん',
}

# Sort by length descending so longer patterns match first
ROMAJI_SORTED = sorted(ROMAJI_MAP.keys(), key=len, reverse=True)

def romaji_to_hiragana(romaji_str):
    """Convert romaji string to hiragana. Returns None if conversion fails badly."""
    if not romaji_str:
        return None
    
    # Normalize: lowercase, strip extra spaces
    s = romaji_str.lower().strip()
    
    # Skip if it's clearly not convertible (contains only non-alpha or is a label)
    if not re.search(r'[a-z]', s):
        return None
    
    # Handle common separators — convert each part
    parts = re.split(r'[\s/·\-]+', s)
    hira_parts = []
    
    for part in parts:
        if not part or not re.search(r'[a-z]', part):
            continue
        
        # Remove parenthetical notes and non-alpha prefixes
        part = re.sub(r'\([^)]*\)', '', part).strip()
        part = re.sub(r'[^a-z\']', '', part)
        
        if not part:
            continue
            
        result = []
        idx = 0
        fail = False
        
        while idx < len(part):
            # Handle double consonant → っ (geminate)
            if idx + 1 < len(part) and part[idx] == part[idx+1] and part[idx] not in 'aeioun':
                result.append('っ')
                idx += 1
                continue
            
            # Handle 'n' before consonant or end (not before vowel)
            if part[idx] == 'n':
                if idx + 1 >= len(part) or part[idx+1] not in 'aeiouyn':
                    result.append('ん')
                    idx += 1
                    continue
            
            # Try matching longest pattern first
            matched = False
            for pattern in ROMAJI_SORTED:
                if part[idx:idx+len(pattern)] == pattern:
                    result.append(ROMAJI_MAP[pattern])
                    idx += len(pattern)
                    matched = True
                    break
            
            if not matched:
                # Handle long vowel marker
                if part[idx] == "'":
                    idx += 1
                    continue
                # Skip unknown chars but mark as partial failure
                idx += 1
                fail = True
        
        if result and not fail:
            hira_parts.append(''.join(result))
        elif result:
            hira_parts.append(''.join(result))  # partial is better than nothing
    
    return ''.join(hira_parts) if hira_parts else None


# ═══════════════════════════════════════════════════════════════════
# SOURCE NAME NORMALIZATION MAP
# ═══════════════════════════════════════════════════════════════════

SOURCE_MAP = {
    'text1l':       'jac-ch1',
    'text2':        'jac-ch2',
    'text3':        'jac-ch3',
    'text4':        'jac-ch4',
    'text5l':       'jac-ch5',
    'text6l':       'jac-ch6',
    'text7l':       'jac-ch7',
    'tt_sample':    'jac-gakka1',
    'tt_sample2':   'jac-gakka2',
    'st_sample_l':  'jac-jitsugi1',
    'st_sample2_l': 'jac-jitsugi2',
    'lifeline4':    'vocab-lifeline',
    'vocab_jac':    'vocab-jac',
    'vocab_core':   'vocab-core',
    'vocab_exam':   'vocab-exam',
    'vocab_teori':  'vocab-teori',
    'vocab_teori v84': 'vocab-teori',
}

SOURCE_META_NEW = {
    'jac-ch1':      { 'label': 'Bab 1 — Keselamatan & Salam',     'emoji': '🙏', 'color': '#c05621' },
    'jac-ch2':      { 'label': 'Bab 2 — Hukum & Regulasi',         'emoji': '⚖️', 'color': '#285e61' },
    'jac-ch3':      { 'label': 'Bab 3 — Jenis Pekerjaan',          'emoji': '🏗️', 'color': '#1a365d' },
    'jac-ch4':      { 'label': 'Bab 4 — Konstruksi & Teknik',      'emoji': '🔩', 'color': '#3c366b' },
    'jac-ch5':      { 'label': 'Bab 5 — Alat & Lifeline',          'emoji': '🔌', 'color': '#744210' },
    'jac-ch6':      { 'label': 'Bab 6 — Pipa & Isolasi',           'emoji': '🌡️', 'color': '#702459' },
    'jac-ch7':      { 'label': 'Bab 7 — Karier & Mesin',           'emoji': '👷', 'color': '#553c9a' },
    'jac-gakka1':   { 'label': 'Soal Contoh — 学科 Set 1',          'emoji': '📋', 'color': '#742a2a' },
    'jac-gakka2':   { 'label': 'Soal Contoh — 学科 Set 2',          'emoji': '📋', 'color': '#742a2a' },
    'jac-jitsugi1': { 'label': 'Soal Contoh — 実技 Set 1',          'emoji': '🔧', 'color': '#22543d' },
    'jac-jitsugi2': { 'label': 'Soal Contoh — 実技 Set 2',          'emoji': '🔧', 'color': '#22543d' },
    'vocab-lifeline':{ 'label': 'Kosakata Wayground — 設備実技',     'emoji': '📖', 'color': '#0369a1' },
    'vocab-jac':    { 'label': 'Kosakata JAC — Dari soal resmi',    'emoji': '📝', 'color': '#1d4ed8' },
    'vocab-core':   { 'label': 'Kosakata Inti — Konstruksi umum',   'emoji': '🏛️', 'color': '#2d3748' },
    'vocab-exam':   { 'label': 'Kosakata Ujian — 250 kata Prometric','emoji': '🎯', 'color': '#7c3aed' },
    'vocab-teori':  { 'label': 'Kosakata Teori — Hukum & safety',  'emoji': '📋', 'color': '#dc2626' },
}


# ═══════════════════════════════════════════════════════════════════
# PHASE 1.1: Parse cards.js, re-ID, normalize sources, add furi
# ═══════════════════════════════════════════════════════════════════

def process_cards():
    print("═══ Processing cards.js ═══")
    
    with open(os.path.join(DATA, "cards.js"), "r") as f:
        content = f.read()
    
    lines = content.split('\n')
    
    # Parse each card line
    id_mapping = {}  # old_id → new_id
    new_id = 0
    output_lines = []
    furi_added = 0
    furi_existed = 0
    sources_normalized = 0
    
    for line in lines:
        # Match card object lines
        m = re.match(r'^(\s*)\{ id: (\d+),(.+)\}(,?)$', line)
        if m:
            indent = m.group(1)
            old_id = int(m.group(2))
            rest = m.group(3)
            comma = m.group(4)
            new_id += 1
            id_mapping[old_id] = new_id
            
            # Replace id
            new_line_parts = [f'{indent}{{ id: {new_id},']
            
            # Normalize source
            src_m = re.search(r'source: "([^"]*)"', rest)
            if src_m:
                old_src = src_m.group(1)
                new_src = SOURCE_MAP.get(old_src, old_src)
                if old_src != new_src:
                    rest = rest.replace(f'source: "{old_src}"', f'source: "{new_src}"')
                    sources_normalized += 1
            
            # Add furi if missing
            has_furi = 'furi:' in rest
            if has_furi:
                furi_existed += 1
            else:
                # Extract romaji to generate furi
                rom_m = re.search(r'romaji: "([^"]*)"', rest)
                if rom_m:
                    romaji = rom_m.group(1)
                    hira = romaji_to_hiragana(romaji)
                    if hira:
                        # Insert furi after source field
                        rest = re.sub(
                            r'(source: "[^"]*",)',
                            rf'\1 furi: "{hira}",',
                            rest
                        )
                        furi_added += 1
            
            new_line_parts.append(rest + '}' + comma)
            output_lines.append(''.join(new_line_parts))
        
        elif '// id 1, 2, 3 dihapus' in line or '// id 142, 143, 144 dihapus' in line:
            # Remove dead comments
            continue
        else:
            output_lines.append(line)
    
    # Fix typo in romaji for old id 1202
    for i, line in enumerate(output_lines):
        if 'supeeसाaa' in line:
            output_lines[i] = line.replace('supeeसाaa', 'supeesaa')
            print(f"  Fixed romaji typo: supeeसाaa → supeesaa")
    
    # Update header comment
    output_lines[0] = f'// SSW Flashcards: CARDS — {new_id} kartu, IDs renumbered 1-{new_id} (Phase 1 normalized)'
    output_lines[1] = '// Schema: { id, category, source, furi, jp, romaji, id_text, desc }'
    output_lines[2] = '// All cards now have furi field. Sources use canonical names (jac-ch1, vocab-exam, etc.)'
    
    with open(os.path.join(DATA, "cards.js"), "w") as f:
        f.write('\n'.join(output_lines))
    
    print(f"  Cards re-IDed: 1-{new_id} ({new_id} total)")
    print(f"  ID mapping: {len(id_mapping)} entries (old max {max(id_mapping.keys())} → new max {new_id})")
    print(f"  Sources normalized: {sources_normalized}")
    print(f"  Furi existed: {furi_existed}, Furi added: {furi_added}")
    
    return id_mapping


# ═══════════════════════════════════════════════════════════════════
# PHASE 1.2: Normalize JAC_OFFICIAL — answer indexing + cross-refs
# ═══════════════════════════════════════════════════════════════════

def process_jac(id_mapping):
    print("\n═══ Processing jac-official.js ═══")
    
    with open(os.path.join(DATA, "jac-official.js"), "r") as f:
        content = f.read()
    
    # Fix answer indexing: 1-based → 0-based
    answer_fixes = 0
    def fix_answer(m):
        nonlocal answer_fixes
        old_val = int(m.group(1))
        new_val = old_val - 1
        answer_fixes += 1
        return f'answer: {new_val}'
    
    content = re.sub(r'answer: (\d+)', fix_answer, content)
    
    # Update related_card_id references
    ref_fixes = 0
    def fix_ref(m):
        nonlocal ref_fixes
        old_id = int(m.group(1))
        new_id = id_mapping.get(old_id, old_id)
        if old_id != new_id:
            ref_fixes += 1
        return f'related_card_id: {new_id}'
    
    content = re.sub(r'related_card_id: (\d+)', fix_ref, content)
    
    # Update header comment
    content = re.sub(
        r'^// SSW Flashcards:.*$',
        '// SSW Flashcards: JAC Official Questions — ~95 soal (Phase 1 normalized)\n'
        '// answer field is now 0-BASED (answer:0 = first option) — UNIFIED with Wayground',
        content,
        count=1,
        flags=re.MULTILINE
    )
    # Remove old warning about 1-based
    content = content.replace('// IMPORTANT: answer field is 1-BASED (answer:1 = first option)\n', '')
    
    with open(os.path.join(DATA, "jac-official.js"), "w") as f:
        f.write(content)
    
    print(f"  Answer indexing: {answer_fixes} values converted 1-based → 0-based")
    print(f"  related_card_id: {ref_fixes} references updated")


# ═══════════════════════════════════════════════════════════════════
# PHASE 1.3: Update Angka Kunci cross-refs
# ═══════════════════════════════════════════════════════════════════

def process_angka(id_mapping):
    print("\n═══ Processing angka-kunci.js ═══")
    
    with open(os.path.join(DATA, "angka-kunci.js"), "r") as f:
        content = f.read()
    
    ref_fixes = 0
    def fix_kartu(m):
        nonlocal ref_fixes
        old_id = int(m.group(1))
        new_id = id_mapping.get(old_id, old_id)
        if old_id != new_id:
            ref_fixes += 1
        return f'kartu: {new_id}'
    
    content = re.sub(r'kartu: (\d+)', fix_kartu, content)
    
    with open(os.path.join(DATA, "angka-kunci.js"), "w") as f:
        f.write(content)
    
    print(f"  kartu refs updated: {ref_fixes}")


# ═══════════════════════════════════════════════════════════════════
# PHASE 1.4: Normalize categories.js — new SOURCE_META
# ═══════════════════════════════════════════════════════════════════

def process_categories():
    print("\n═══ Processing categories.js ═══")
    
    with open(os.path.join(DATA, "categories.js"), "r") as f:
        content = f.read()
    
    # Replace old SOURCE_META with new normalized one
    # Find and replace the SOURCE_META block
    meta_lines = ['export const SOURCE_META = {']
    for src, meta in SOURCE_META_NEW.items():
        meta_lines.append(f'  "{src}": {{ label: "{meta["label"]}", emoji: "{meta["emoji"]}", color: "{meta["color"]}" }},')
    meta_lines.append('};')
    new_meta = '\n'.join(meta_lines)
    
    content = re.sub(
        r'export const SOURCE_META = \{[^}]+\};',
        new_meta,
        content,
        flags=re.DOTALL
    )
    
    # Update VOCAB_SOURCES to use new names
    content = content.replace(
        'export const VOCAB_SOURCES = ["lifeline4", "vocab_jac", "vocab_core", "vocab_exam", "vocab_teori"];',
        'export const VOCAB_SOURCES = ["vocab-lifeline", "vocab-jac", "vocab-core", "vocab-exam", "vocab-teori"];'
    )
    
    # Update SOURCE_GROUPS
    content = re.sub(
        r'export const SOURCE_GROUPS = \[.*?\];',
        '''export const SOURCE_GROUPS = [
  { label: "PDF Utama JAC", keys: ["jac-ch1","jac-ch2","jac-ch3","jac-ch4","jac-ch5","jac-ch6","jac-ch7"] },
  { label: "Soal Contoh", keys: ["jac-gakka1","jac-gakka2","jac-jitsugi1","jac-jitsugi2"] },
  { label: "Kosakata", keys: ["vocab-lifeline","vocab-jac","vocab-core","vocab-exam","vocab-teori"] },
];''',
        content,
        flags=re.DOTALL
    )
    
    # Update SOURCE_ACCENT
    content = re.sub(
        r'export const SOURCE_ACCENT = \{[^}]+\};',
        '''export const SOURCE_ACCENT = {
  "jac-ch1": "#ed8936", "jac-ch2": "#38b2ac", "jac-ch3": "#667eea", "jac-ch4": "#ed64a6",
  "jac-ch5": "#ecc94b", "jac-ch6": "#9f7aea", "jac-ch7": "#48bb78",
  "jac-gakka1": "#fc8181", "jac-gakka2": "#fc8181", "jac-jitsugi1": "#68d391", "jac-jitsugi2": "#68d391",
  "vocab-lifeline": "#63b3ed", "vocab-jac": "#93c5fd", "vocab-core": "#cbd5e0", "vocab-exam": "#b794f4", "vocab-teori": "#f56565",
};''',
        content,
        flags=re.DOTALL
    )
    
    with open(os.path.join(DATA, "categories.js"), "w") as f:
        f.write(content)
    
    print(f"  SOURCE_META: {len(SOURCE_META_NEW)} canonical sources")
    print(f"  VOCAB_SOURCES: updated to new names")
    print(f"  SOURCE_GROUPS: updated to new names")
    print(f"  SOURCE_ACCENT: updated to new names")


# ═══════════════════════════════════════════════════════════════════
# PHASE 1.5: Save ID mapping for reference
# ═══════════════════════════════════════════════════════════════════

def save_mapping(id_mapping):
    mapping_file = os.path.join(REPO, "docs", "id-mapping-v87-to-v90.json")
    with open(mapping_file, "w") as f:
        json.dump(id_mapping, f, indent=2, sort_keys=True)
    print(f"\n═══ ID mapping saved: {mapping_file} ═══")
    print(f"  {len(id_mapping)} entries")


# ═══════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("╔══════════════════════════════════════════╗")
    print("║  Phase 1: Foundation — Data Normalization ║")
    print("╚══════════════════════════════════════════╝\n")
    
    id_mapping = process_cards()
    process_jac(id_mapping)
    process_angka(id_mapping)
    process_categories()
    save_mapping({str(k): v for k, v in id_mapping.items()})
    
    print("\n" + "═" * 50)
    print("Phase 1 COMPLETE!")
    print("═" * 50)
    print("\nVerify with: grep -c '{ id:' src/data/cards.js")
    print("           grep 'answer: ' src/data/jac-official.js | head -5")
    print("           grep 'furi:' src/data/cards.js | wc -l")
