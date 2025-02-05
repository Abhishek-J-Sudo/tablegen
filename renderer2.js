let latestBeautifiedHtml = ''; // Variable to hold the latest beautified HTML

document.getElementById('renderButton').addEventListener('click', renderOutput);

// New function to handle live updates
document.getElementById('htmlInput').addEventListener('input', function () {
    // Capture current input value
    const input = document.getElementById('htmlInput').value;
    // Only update after each new line
    if (input.endsWith('\n')) {
        renderOutput(); // Call the render function
    }
});

function renderOutput() {
    const input = document.getElementById('htmlInput').value;
    const outputDiv = document.getElementById('output');

    // Function to process tag attributes and styles (no changes)
    function processAttributes(tag, attrs) {
        let colspan = attrs.match(/col(\d+)/) ? ` colspan="${attrs.match(/col(\d+)/)[1]}"` : '';
        let width = attrs.match(/w(\d+)/) ? ` width="${attrs.match(/w(\d+)/)[1]}"` : '';
        let height = attrs.match(/\bh(\d+)\b/) ? ` height="${attrs.match(/\bh(\d+)\b/)[1]}"` : '';
        let fontSize = attrs.match(/f(\d+)/) ? ` font-size: ${attrs.match(/f(\d+)/)[1]}px;` : '';

        let align = '';
        if (/\bal\b/.test(attrs) || /\bleft\b/.test(attrs)) {
            align = ` text-align: left;`;
        } else if (/\bar\b/.test(attrs)) {
            align = ` text-align: right;`;
        } else if (/\bac\b/.test(attrs)) {
            align = ` text-align: center;`;
        }

        let valign = attrs.match(/val/) ? ` vertical-align: top;` : '';
        let color = attrs.match(/c([0-9a-fA-F]{3,6})/) ? ` color: #${attrs.match(/c([0-9a-fA-F]{3,6})/)[1]};` : '';
        let bgColor = attrs.match(/bg([0-9a-fA-F]{3,6})/) ? ` background-color: #${attrs.match(/bg([0-9a-fA-F]{3,6})/)[1]};` : '';
        let lineHeight = attrs.match(/lh([0-9a-zA-Z%]+)/) ? ` line-height: ${attrs.match(/lh([0-9a-zA-Z%]+)/)[1]};` : '';
        let fontFamily = attrs.match(/ff([^\s]+)/) ? ` font-family: ${attrs.match(/ff([^\s]+)/)[1]}, sans-serif;` : '';
        let border = attrs.match(/border:\s*([^,]+)/) ? ` border: ${attrs.match(/border:\s*([^,]+)/)[1]};` : '';

        let style = (fontSize || align || valign || color || bgColor || lineHeight || fontFamily || border) ? 
            ` style="${fontSize}${align}${valign}${color}${bgColor}${lineHeight}${fontFamily}${border}"` : '';

        let remainingAttrs = attrs
            .replace(/col\d+|w\d+|\bh\d+\b|f\d+|\bal\b|\bar\b|\bac\b|\bleft\b|\bright\b|val|c[0-9a-fA-F]{3,6}|bg[0-9a-fA-F]{3,6}|lh[0-9a-zA-Z%]+|ff([^\s]+)|border:\s*([^,]+)/g, '')
            .trim();

        return `<${tag}${colspan}${width}${height}${style}>${remainingAttrs}`;
    }

    let html = '';
    let nestingLevel = 0;
    let inTD = false;
    let currentTDContent = '';
    let tableStack = [];

    const lines = input.split('\n');

    for (let line of lines) {
        line = line.trim();
        console.log(`Processing line: ${line}`);
        let isValid = true; // Assume valid until proven otherwise

        if (/^t(\d+%|\d+px)?$/.test(line)) {
            const twMatch = line.match(/^t(\d+%|\d+px)?$/);
            const tw = twMatch && twMatch[1] ? twMatch[1] : '100%';

            if (currentTDContent) {
                html += currentTDContent + '</tbody></table>';
                currentTDContent = '';
            }
            html += `<table style="width: ${tw}; border-collapse: collapse;" cellpadding="0" cellspacing="0" align="center" border="1"><tbody>`;
            nestingLevel++;
            console.log(`Table detected with width: ${tw}`);

        } else if (/^nest t(\d+%|\d+px)/.test(line)) {
            const twMatch = line.match(/nest t(\d+%|\d+px)/);
            const tw = twMatch ? twMatch[1] : '100%';
            currentTDContent += `<table style="width: ${tw}; border-collapse: collapse;" cellpadding="0" cellspacing="0" align="center" border="1"><tbody>`;
            nestingLevel++;
            console.log(`Nested table detected with width: ${tw}`);
            tableStack.push(nestingLevel);
        } else if (/^end/.test(line)) {
            if (currentTDContent) {
                currentTDContent += '</tbody></table>';
                nestingLevel--;
                console.log(`Ending nested table`);
                if (tableStack.length > 0) {
                    tableStack.pop();
                }
            }
            if (tableStack.length === 0) {
                inTD = false;
            }
        } else if (/^tr\s*([^<]*)/.test(line)) {
            if (inTD) {
                currentTDContent += '</tr>';
            }
            const attrs = line.match(/^tr\s*(.*)$/)[1];
            console.log('Row detected:', attrs);
            currentTDContent += processAttributes('tr', attrs);
            inTD = true;
        } else if (/^td\s*([^<]*)/.test(line) && inTD) {
            const attrs = line.match(/^td\s*(.*)$/)[1];
            console.log('Cell detected:', attrs);
            currentTDContent += processAttributes('td', attrs);
        } else if (/^content:\s*(.*)/.test(line)) {
            const content = line.match(/^content:\s*(.*)/)[1];
            console.log('Content detected:', content);
            currentTDContent += content;
        } else if (/^img\s+/.test(line)) {
            const match = line.match(/^img\s+(w(\d+)\s+)?(.*?)(\s+(al|ar|ac))?$/);

            const imgWidth = match[2] || '';
            const imgSrc = match[3] ? match[3].trim() : '';
            const alignment = match[5] || '';

            let alignStyle = 'align="center"';
            if (alignment === 'ar') {
                alignStyle = 'align="right"';
            } else if (alignment === 'al') {
                alignStyle = 'align="left"';
            }

            console.log('Image detected with source:', imgSrc, 'width:', imgWidth, 'and alignment:', alignment);

            if (inTD) {
                let imgTag = `<img src="${imgSrc}" ${imgWidth ? `width="${imgWidth}"` : ''} ${alignStyle}>`.trim();
                currentTDContent += imgTag;
            }
        }
    }

    if (currentTDContent) {
        html += currentTDContent;
    }

    while (nestingLevel > 0) {
        html += '</tbody></table>';
        nestingLevel--;
    }

    outputDiv.innerHTML = html;
    console.log('Final HTML code:', html);

    latestBeautifiedHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <title></title>
        <meta charset="UTF-8">
        <meta content="width=device-width, initial-scale=1" name="viewport"/>
        <style type="text/css">
            @media only screen and (min-width: 600px) {
                ol, ul {
                    padding-left: 10px!important;
                }
                li {
                    padding-left: 5px!important;
                }
            }
            @media only screen and (max-width: 600px) {
                table.container {
                    width: 100%!important;
                }
                ol, ul {
                    padding-left: 10px!important;
                }
                li {
                    font-size: 9px!important;
                    padding-left: 5px!important;
                }
                td.banner img {
                    width: 100%!important;
                }
                td.h1 {
                    font-size: 20px!important;
                }
                td.h2 {
                    font-size: 14px!important;
                }
                td.copy {
                    font-size: 13px!important;
                }
                td.shopnow img {
                    width: 25px!important;
                }
                td.disclaimer {
                    font-size: 9px!important;
                }
                td.social img {
                    width: 20px!important;
                }
                td.gutter {
                    width: 20px!important;
                }
                td.w540 {
                    width: 90%!important;
                }
            }
            @media only screen and (max-width: 400px) {
                td.banner img {
                    width: 100%!important;
                }
                td.h1 {
                    font-size: 14px!important;
                }
                td.h2 {
                    font-size: 13px!important;
                }
                td.copy {
                    font-size: 11px!important;
                }
                ul.bullet {
                    font-size: 11px!important;
                }
                td.shopnow img {
                    width: 25px!important;
                }
                td.social img {
                    width: 14px!important;
                }
                td.gutter {
                    width: 20px!important;
                }
            }
        </style>
    </head>
    <body style="margin:0px">
        <center>
            ${html_beautify(outputDiv.innerHTML, {
                indent_size: 4,
                wrap_line_length: 80,
                preserve_newlines: true
            })}
        </center>
    </body>
    </html>`;

}

// Set up download button click listener only once
document.getElementById('downloadBtn').addEventListener('click', function () {
    const blob = new Blob([latestBeautifiedHtml], { type: 'text/html' });
    const link = document.createElement('a');
    link.download = 'index.html';
    link.href = URL.createObjectURL(blob);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});
