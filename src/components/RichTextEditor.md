# Rich Text Editor Component

## Overview
The RichTextEditor component provides rich text formatting capabilities for comments across the PMS application. It supports bold, italic, underline, strikethrough, lists, headers, and links.

## Features
- **Bold text** - Make text bold
- *Italic text* - Make text italic
- <u>Underlined text</u> - Underline text
- ~~Strikethrough text~~ - Cross out text
- Headers (H1, H2, H3) - Create section headers
- Bulleted and numbered lists - Create organized lists
- Links - Add clickable links
- Clean formatting - Remove all formatting

## Usage

### RichTextEditor Component
```tsx
import { RichTextEditor } from './RichTextEditor';

<RichTextEditor
  value={content}
  onChange={setContent}
  placeholder="Add a comment..."
  className="min-h-[120px]"
  readOnly={false}
/>
```

### FormattedText Component
```tsx
import { FormattedText } from './RichTextEditor';

<FormattedText content={htmlContent} />
```

## Integration
The rich text editor is integrated into:
- CommentSection (stage comments)
- CommentManager (global comments)
- ProjectCommentSection (project comments)
- TaskCard (task descriptions)

## Database Storage
The formatted content is stored as HTML in the existing `text` fields in the database:
- `global_comments.text`
- `tasks.description`
- Comment task text fields

## Styling
Custom CSS is provided in `RichTextEditor.css` to ensure consistent styling with the application theme.

## User Roles
All user roles (Manager, Employee, Client) have access to rich text formatting in their respective comment sections.



