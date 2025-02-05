# tablegen

The purpose of this tool is to help build html email template which are short and minimal.
You are required to have basic html/css knowledge. The tool will help you generate a layout quickly.
Rest of the work will require efforts in adding content and finalizing the layout via html/css.

# Instructions

t[number% or px]: Creates a table with a specified width.
Example: t100%, t600px

tr: Creates a new table row.
Example: tr

td [col, w[number], h[number], f[number], al|ac|ar, val, c[hex], bg[hex], lh[number], ff[font-family], border:]

[colspan[col], wdith[w], height[h], font-size[f], text-align:[ac, al, ar], valign[val],
color[c], background-color[bg], line-height[lh], font-family[ff], border:1px solid #000]
Creates a new table cell with multiple optional attributes.
Example: td col3 w200 h100 f16 ac c000 bgfff lh150% ffArial border: 1px solid #000

col[number]: Specifies the colspan for the table cell.
Example: td col3

h[number]: Specifies the height of a table cell in pixels.
Example: td h100

To add text in <td> use content: [Add text]
Example: content: Type your content here
content: [string]

To add image in <td> use img in a new line
Example: img ./images/banner.jpg w30 ac
img [path, width, align]

nest is used for nesting tables. Tables created after that will follow the same level, unless end command is given
end command drop your nesting level by 1, any table added after that will follow that level
