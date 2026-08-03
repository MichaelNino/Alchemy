export class HTMLAdapter {
    static serialize(buffer) {
        let iter = buffer.get_start_iter();
        let html = '';
        
        while (!iter.is_end()) {
            const nextToggle = iter.copy();
            nextToggle.forward_to_tag_toggle(null);
            
            let text = buffer.get_text(iter, nextToggle, false);
            // Escape HTML entities
            text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
            
            const tags = iter.get_tags();
            let wrapperStart = '';
            let wrapperEnd = '';
            
            tags.forEach(tag => {
                if (tag.name === 'bold') { wrapperStart += '<b>'; wrapperEnd = '</b>' + wrapperEnd; }
                else if (tag.name === 'italic') { wrapperStart += '<i>'; wrapperEnd = '</i>' + wrapperEnd; }
                else if (tag.name === 'underline') { wrapperStart += '<u>'; wrapperEnd = '</u>' + wrapperEnd; }
                else if (tag.name === 'strikethrough') { wrapperStart += '<s>'; wrapperEnd = '</s>' + wrapperEnd; }
            });
            
            html += wrapperStart + text + wrapperEnd;
            iter = nextToggle;
        }
        
        return `<p>${html}</p>`;
    }
    
    static deserialize(html, buffer) {
        buffer.set_text('', -1);
        // Simple regex-based tag replacement for Pango markup
        // Convert HTML to Pango
        let pango = html.replace(/<p>/g, '').replace(/<\/p>/g, '\n');
        pango = pango.replace(/<br\s*\/?>/gi, '\n');
        // Pango supports <b>, <i>, <u>, <s>. 
        // We can just use insert_markup, but to ensure our custom tags are applied,
        // it's easier to use a manual tokenizer or just let insert_markup handle it,
        // then normalize tags if needed.
        // Actually, let's just use a simple regex tokenizer to apply OUR tags:
        
        const tagMap = {
            'b': 'bold', 'strong': 'bold',
            'i': 'italic', 'em': 'italic',
            'u': 'underline',
            's': 'strikethrough', 'strike': 'strikethrough'
        };
        
        // Strip out unsupported tags and parse
        // For a robust implementation in JS without DOM, we iterate through regex matches
        let cursor = 0;
        const regex = /<\/?([a-z0-9]+)[^>]*>|&[a-z]+;|&#[0-9]+;/gi;
        let match;
        
        const activeTags = new Set();
        let iter = buffer.get_start_iter();
        
        while ((match = regex.exec(html)) !== null) {
            // Text before match
            if (match.index > cursor) {
                const text = html.substring(cursor, match.index);
                buffer.insert(iter, text, -1);
                // Apply active tags to this inserted chunk
                const startIter = iter.copy();
                startIter.backward_chars(text.length);
                activeTags.forEach(tagName => {
                    buffer.apply_tag_by_name(tagName, startIter, iter);
                });
            }
            
            // Handle match
            const token = match[0].toLowerCase();
            if (token.startsWith('</')) {
                const tag = match[1].toLowerCase();
                if (tag === 'p' || tag === 'div') {
                    buffer.insert(iter, '\n', -1);
                } else if (tagMap[tag]) {
                    activeTags.delete(tagMap[tag]);
                }
            } else if (token.startsWith('<')) {
                const tag = match[1].toLowerCase();
                if (tag === 'br') {
                    buffer.insert(iter, '\n', -1);
                } else if (tag === 'p' || tag === 'div') {
                    // Do nothing for start of block, or insert newline if not at start
                    if (!iter.is_start()) buffer.insert(iter, '\n', -1);
                } else if (tagMap[tag]) {
                    activeTags.add(tagMap[tag]);
                }
            } else if (token.startsWith('&')) {
                // Handle basic entities
                let char = token;
                if (token === '&amp;') char = '&';
                else if (token === '&lt;') char = '<';
                else if (token === '&gt;') char = '>';
                else if (token === '&nbsp;') char = ' ';
                
                buffer.insert(iter, char, -1);
                const startIter = iter.copy();
                startIter.backward_chars(1);
                activeTags.forEach(tagName => {
                    buffer.apply_tag_by_name(tagName, startIter, iter);
                });
            }
            
            cursor = regex.lastIndex;
        }
        
        // Trailing text
        if (cursor < html.length) {
            const text = html.substring(cursor);
            buffer.insert(iter, text, -1);
            const startIter = iter.copy();
            startIter.backward_chars(text.length);
            activeTags.forEach(tagName => {
                buffer.apply_tag_by_name(tagName, startIter, iter);
            });
        }
    }
}

export class MarkdownAdapter {
    static serialize(buffer) {
        let iter = buffer.get_start_iter();
        let md = '';
        
        while (!iter.is_end()) {
            const nextToggle = iter.copy();
            nextToggle.forward_to_tag_toggle(null);
            
            const text = buffer.get_text(iter, nextToggle, false);
            const tags = iter.get_tags();
            
            let wrapperStart = '';
            let wrapperEnd = '';
            
            tags.forEach(tag => {
                if (tag.name === 'bold') { wrapperStart += '**'; wrapperEnd = '**' + wrapperEnd; }
                else if (tag.name === 'italic') { wrapperStart += '*'; wrapperEnd = '*' + wrapperEnd; }
                else if (tag.name === 'strikethrough') { wrapperStart += '~~'; wrapperEnd = '~~' + wrapperEnd; }
            });
            // Note: Markdown doesn't natively support underline, often HTML <u> is used.
            // We will use HTML <u> for underline in Markdown serialization as a fallback.
            tags.forEach(tag => {
                if (tag.name === 'underline') { wrapperStart += '<u>'; wrapperEnd = '</u>' + wrapperEnd; }
            });
            
            md += wrapperStart + text + wrapperEnd;
            iter = nextToggle;
        }
        
        return md;
    }
    
    static deserialize(md, buffer) {
        buffer.set_text('', -1);
        
        // A very basic markdown lexer for **bold**, *italic*, ~~strike~~
        // For a full implementation, a robust parser is needed. This is a naive regex approach.
        let cursor = 0;
        const regex = /(\*\*|__|~~|\*|_|<\/?u>)/g;
        let match;
        
        const activeTags = new Set();
        let iter = buffer.get_start_iter();
        
        while ((match = regex.exec(md)) !== null) {
            if (match.index > cursor) {
                const text = md.substring(cursor, match.index);
                buffer.insert(iter, text, -1);
                const startIter = iter.copy();
                startIter.backward_chars(text.length);
                activeTags.forEach(tagName => {
                    buffer.apply_tag_by_name(tagName, startIter, iter);
                });
            }
            
            const token = match[0];
            let tagToToggle = null;
            if (token === '**' || token === '__') tagToToggle = 'bold';
            else if (token === '*' || token === '_') tagToToggle = 'italic';
            else if (token === '~~') tagToToggle = 'strikethrough';
            else if (token === '<u>' || token === '</u>') tagToToggle = 'underline';
            
            if (tagToToggle) {
                if (activeTags.has(tagToToggle)) activeTags.delete(tagToToggle);
                else activeTags.add(tagToToggle);
            }
            
            cursor = regex.lastIndex;
        }
        
        if (cursor < md.length) {
            const text = md.substring(cursor);
            buffer.insert(iter, text, -1);
            const startIter = iter.copy();
            startIter.backward_chars(text.length);
            activeTags.forEach(tagName => {
                buffer.apply_tag_by_name(tagName, startIter, iter);
            });
        }
    }
}
