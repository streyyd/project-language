# Third-Party Notices

## AnimCJK Japanese kana SVG data

This project uses the Hiragana あ SVG data from AnimCJK.

- Project: https://github.com/parsimonhi/animCJK
- Source file: https://github.com/parsimonhi/animCJK/blob/c63765b150cbd567c71d05cf4a4f8d00b57045c9/svgsJaKana/12354.svg
- Used commit: `c63765b150cbd567c71d05cf4a4f8d00b57045c9`
- Copyright: AnimCJK 2016-2026, FM-SH
- License: GNU Lesser General Public License v3 or later

The source states that AnimCJK SVG files representing kana may be redistributed
and modified under LGPL v3 or later. The license text is preserved in
`licenses/animcjk-LGPL-v3.txt`.

The selected data is represented in
`src/features/writing/kanaAAnimCjkTemplate.ts`. It includes the source
stroke outline paths, median paths, logical stroke grouping, and the split
third logical stroke segments `3a` and `3b`.
