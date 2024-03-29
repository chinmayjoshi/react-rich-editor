import React, { useCallback, useMemo, useState } from 'react';
import isHotkey from 'is-hotkey';
import { Editable, withReact, Slate } from 'slate-react';
import { isKeyHotkey } from 'is-hotkey';
import { Transforms, createEditor, Range } from 'slate';
import { withHistory } from 'slate-history';

// import Leaf from './Common/Leaf';
import Toolbar from './ToolBar/Toolbar';
import { MarkButton, toggleMark } from './ToolBar/MarkButton';
import { BlockButton } from './ToolBar/BlockButton';
import Elements from './Common/Elements';
import Leaf from './Common/Leaf';

import { withImages, InsertImageButton } from './Image/InsertImageButton';
import { withLinks } from './Link/linkUtilFunctions';
import AddLinkButton from './Link/AddLinkButton';
import RemoveLinkButton from './Link/RemoveLinkButton';

import '../styles/editor.css';
import TagContainer from './Highlight/TagContainer';

// for all rich editor hot keys
const HOTKEYS = {
	'mod+b': 'bold',
	'mod+i': 'italic',
	'mod+u': 'underline',
	'mod+`': 'code',
};

const SlateEditor = () => {
	// to store the styled text as html
	const [value, setValue] = useState(initialValue);

	// renderElement is used to render custom elements
	const renderElement = useCallback((props) => {
		return <Elements {...props} />;
	}, []);

	// to handle rendering leaves
	const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

	// the slate editor object
	const editor = useMemo(
		() => withLinks(withImages(withHistory(withReact(createEditor())))),
		[]
	);

	return (
		<div className='editor-container'>
			<Slate
				className='rich-editor'
				editor={editor}
				value={value}
				onChange={(value) => setValue(value)}>
				<Toolbar style={{ width: '90%' }}>
					{/* add all toolbar options */}
					<MarkButton format='bold' icon='format_bold' title='bold' />
					<MarkButton
						format='italic'
						icon='format_italic'
						title='italic'
					/>
					<MarkButton
						format='underline'
						icon='format_underlined'
						title='underline'
					/>
					<MarkButton format='code' icon='code' title='code' />
					<BlockButton
						format='heading-one'
						icon='looks_one'
						title='heading 1'
					/>
					<BlockButton
						format='heading-two'
						icon='looks_two'
						title='heading 2'
					/>
					<BlockButton
						format='block-quote'
						icon='format_quote'
						title='quote'
					/>
					<BlockButton
						format='numbered-list'
						icon='format_list_numbered'
						title='numbered list'
					/>
					<BlockButton
						format='bulleted-list'
						icon='format_list_bulleted'
						title='bulletted list'
					/>
					<BlockButton
						format='left'
						icon='format_align_left'
						title='left align'
					/>
					<BlockButton
						format='center'
						icon='format_align_center'
						title='center align'
					/>
					<BlockButton
						format='right'
						icon='format_align_right'
						title='right align'
					/>
					<BlockButton
						format='justify'
						icon='format_align_justify'
						title='justify'
					/>
					<InsertImageButton title='image' />
					<AddLinkButton title='add link' />
					<RemoveLinkButton title='remove link' />
					<MarkButton
						format='highlight'
						icon='format_color_fill'
						title='highlight'
					/>
				</Toolbar>
				{/* the slate editor */}
				<Editable
					className='rich-editor'
					renderElement={renderElement}
					renderLeaf={renderLeaf}
					placeholder='Enter some rich text…'
					spellCheck
					autoFocus
					// check if hotkeys are pressed and then toggle the correct option from toolbar
					onKeyDown={(event) => {
						for (const hotkey in HOTKEYS) {
							if (isHotkey(hotkey, event)) {
								event.preventDefault();
								const mark = HOTKEYS[hotkey];
								toggleMark(editor, mark);
							}
						}
						const { selection } = editor;

						// Default left/right behavior is unit:'character'.
						// This fails to distinguish between two cursor positions, such as
						// <inline>foo<cursor/></inline> vs <inline>foo</inline><cursor/>.
						// Here the modified behavior unit is 'offset'.
						// This lets the user step into and out of the inline without stepping over characters.
						// You may wish to customize this further to only use unit:'offset' in specific cases.
						if (selection && Range.isCollapsed(selection)) {
							const { nativeEvent } = event;
							if (isKeyHotkey('left', nativeEvent)) {
								event.preventDefault();
								Transforms.move(editor, {
									unit: 'offset',
									reverse: true,
								});
								return;
							}
							if (isKeyHotkey('right', nativeEvent)) {
								event.preventDefault();
								Transforms.move(editor, { unit: 'offset' });
								return;
							}
						}
					}}
				/>
			</Slate>
			<TagContainer />
		</div>
	);
};

// to display some intial text
const initialValue = [
	{
		type: 'paragraph',
		children: [
			{ text: 'This is editable ' },
			{ text: 'rich', bold: true },
			{ text: ' text, ' },
			{ text: 'much', italic: true },
			{ text: ' better than a ' },
			{ text: '<textarea>', code: true },
			{ text: '!' },
		],
	},
	{
		type: 'paragraph',
		children: [
			{
				text: "Since it's rich text, you can do things like turn a selection of text ",
			},
			{ text: 'bold', bold: true },
			{
				text: ', or add a semantically rendered block quote in the middle of the page, like this:',
			},
		],
	},
	{
		type: 'block-quote',
		children: [{ text: 'A wise quote.' }],
	},
	{
		type: 'paragraph',
		align: 'left',
		children: [{ text: 'Try it out for yourself!' }],
	},
];

export default SlateEditor;
