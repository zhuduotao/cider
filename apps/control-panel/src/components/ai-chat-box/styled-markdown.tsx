import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import {Prism as SyntaxHighlighter, SyntaxHighlighterProps} from "react-syntax-highlighter";
import Markdown from 'react-markdown'
import dracula from './styles/dracula'
import './styles/markdown.css'

export function StyledMarkdown(
  props: {
    value: string
  }
) {
  return (
    <Markdown
      className="markdown-body w-full"
      remarkPlugins={[
        remarkMath
      ]}
      rehypePlugins={[
        rehypeKatex,
        // rehypeHighlight({prefix:'hl'}),
        // rehypePrettyCode,
      ]}
      components={{
        code(props) {
          const {children, className, ...rest} = props
          const match = /language-(\w+)/.exec(className || '')
          return match ? (
            <SyntaxHighlighter
              {...(rest as SyntaxHighlighterProps)}
              PreTag="div"
              language={match[1]}
              style={dracula}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code {...rest} className={className}>
              {children}
            </code>
          )
        }
      }}
    >
      {props.value}
    </Markdown>
  )
}