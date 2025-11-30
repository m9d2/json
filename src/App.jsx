import React, { useState, useEffect } from 'react';
import { 
  Braces, 
  Copy, 
  Trash2, 
  Minimize2, 
  Maximize2,
  AlertCircle, 
  Check, 
  FileJson,
  MinusSquare,
  PlusSquare,
  ChevronsDown,
  ChevronsRight,
  Code2,
  Layout,
  ListOrdered
} from 'lucide-react';

// --- 核心组件：交互式代码节点 ---
const JsonCodeNode = ({ name, value, isLast, level = 0, defaultExpanded, showLineNumbers }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  
  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);
  const isEmpty = isObject && Object.keys(value).length === 0;
  const lineNumberOffset = 3 + level * 1.5; // 基于缩进计算行号的偏移量（单位 rem）
  const closingLineOffset = lineNumberOffset + 1.5; // 闭合括号行所在的缩进偏移
  
  const handleToggle = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  // 视觉缩进控制 (pl-6 = 1.5rem)。去掉了 ml-1 以确保行号计算准确。
  const indentClass = "pl-6 border-l border-gray-100"; 

  // 行号组件
  const LineNo = () => showLineNumbers ? (
    <span className="line-number" style={{ '--line-offset': `${lineNumberOffset}rem` }} />
  ) : null;

  // 渲染基本值
  const renderPrimitive = (val) => {
    if (val === null) return <span className="text-gray-500 font-bold italic">null</span>;
    if (typeof val === 'string') return <span className="text-green-600 break-all">"{val}"</span>;
    if (typeof val === 'number') return <span className="text-blue-600 font-medium">{val}</span>;
    if (typeof val === 'boolean') return <span className="text-orange-600 font-bold">{val.toString()}</span>;
    return <span>{String(val)}</span>;
  };

  // 渲染键名
  const renderKey = () => {
    if (name === null) return null; 
    return <span className="text-purple-700 font-medium hover:text-purple-900 transition-colors">"{name}"<span className="text-gray-500 select-none">: </span></span>;
  };

  // 1. 基本数据类型渲染
  if (!isObject) {
    return (
      <div 
        className="font-mono text-sm leading-7 hover:bg-gray-100 rounded-sm -ml-2 pl-2 transition-colors flex relative"
        style={{ '--level': level }}
      >
         <LineNo />
         <div className="flex-1 flex items-start break-all">
            {name !== null && <span className="w-5 inline-block shrink-0"></span>}
            <div>
              {renderKey()}
              {renderPrimitive(value)}
              {!isLast && <span className="text-gray-500 select-none">,</span>}
            </div>
         </div>
      </div>
    );
  }

  // 2. 对象/数组渲染
  const keys = Object.keys(value);
  const openBracket = isArray ? '[' : '{';
  const closeBracket = isArray ? ']' : '}';
  const itemType = isArray ? 'Array' : 'Object';
  const itemCount = keys.length;
  
  const collapsedSummary = (
    <span 
      className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded cursor-pointer hover:bg-gray-200 select-none mx-2 transition-colors border border-gray-200"
      onClick={handleToggle}
    >
      {itemCount} items
    </span>
  );

  return (
    <div className="font-mono text-sm leading-7">
      {/* Header Line (Key + Open Bracket) */}
      <div 
        className="hover:bg-gray-100 rounded-sm -ml-2 pl-2 transition-colors flex items-start group relative"
        style={{ '--level': level }}
      >
        <LineNo />
        <div className="flex-1 flex flex-wrap items-center">
          
          {/* 折叠按钮 */}
          <span 
            className="w-5 h-6 flex items-center justify-center shrink-0 cursor-pointer text-gray-400 hover:text-gray-600 select-none mr-0.5 transition-colors opacity-70 group-hover:opacity-100"
            onClick={handleToggle}
          >
            {isEmpty ? (
              <span className="w-3 h-3"></span> 
            ) : (
              expanded ? <MinusSquare size={14} strokeWidth={1.5} /> : <PlusSquare size={14} strokeWidth={1.5} />
            )}
          </span>

          <div className="flex items-center">
             {renderKey()}
             <span className="text-gray-800 font-bold select-none">{openBracket}</span>
          </div>

          {!expanded && !isEmpty && (
            <>
              {collapsedSummary}
              <span className="text-gray-800 font-bold select-none">{closeBracket}</span>
              {!isLast && <span className="text-gray-500 select-none">,</span>}
            </>
          )}

          {isEmpty && (
             <>
               <span className="text-gray-800 font-bold select-none">{closeBracket}</span>
               {!isLast && <span className="text-gray-500 select-none">,</span>}
             </>
          )}
        </div>
      </div>

      {/* Children */}
      {expanded && !isEmpty && (
        <div className={indentClass}>
          {keys.map((key, idx) => (
            <JsonCodeNode 
              key={key} 
              name={isArray ? null : key} 
              value={value[key]} 
              isLast={idx === keys.length - 1} 
              level={level + 1} 
              defaultExpanded={defaultExpanded}
              showLineNumbers={showLineNumbers}
            />
          ))}
          {/* Closing Bracket Line */}
          <div 
            className="hover:bg-gray-100 rounded-sm -ml-2 pl-2 flex relative"
            style={{ '--level': level + 1 }} /* 闭合括号逻辑上缩进一级 */
          >
             {/* 行号修正：闭合括号所在行 */}
             <div 
               className={showLineNumbers ? "line-number" : "hidden"} 
               style={{ '--line-offset': `${closingLineOffset}rem` }} 
             />
             
             <div className="flex-1 flex">
                <span className="w-5 inline-block shrink-0"></span>
                <div>
                   <span className="text-gray-800 font-bold select-none">{closeBracket}</span>
                   {!isLast && <span className="text-gray-500 select-none">,</span>}
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [parsedData, setParsedData] = useState(null); 
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  
  const [treeKey, setTreeKey] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showLineNumbers, setShowLineNumbers] = useState(false); // 默认关闭行号

  const demoJson = {
    "app": "JSON Viewer",
    "version": 4.1,
    "features": ["Fixed Slash Issue", "Line Numbers", "Classic Theme"],
    "settings": {
      "minify": true,
      "theme": "classic"
    },
    "active": true,
    "stats": null
  };

  const loadDemo = () => {
    const json = JSON.stringify(demoJson, null, 2);
    setInput(json);
  };

  // 自动格式化逻辑
  useEffect(() => {
    if (!input.trim()) {
      setParsedData(null);
      setError(null);
      return;
    }
    const timer = setTimeout(() => {
      try {
        const parsed = JSON.parse(input);
        setParsedData(parsed);
        setError(null);
      } catch (e) {
        setError(e.message);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [input]);

  const handleMinifyInput = () => {
    try {
      if (!input.trim()) return;
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed));
    } catch (e) {}
  };
  
  const handleFormatInput = () => {
    try {
      if (!input.trim()) return;
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed, null, 2));
    } catch (e) {}
  };

  const toggleExpand = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    setTreeKey(prev => prev + 1);
  };

  const handleCopy = () => {
    if (!parsedData) return;
    const text = JSON.stringify(parsedData, null, 2);
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      if (document.execCommand('copy')) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {}
    document.body.removeChild(textArea);
  };

  const handleClear = () => {
    setInput('');
    setParsedData(null);
    setError(null);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col font-sans text-slate-800 overflow-hidden selection:bg-blue-100 selection:text-blue-900">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between shadow-sm z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-1.5 rounded-lg text-white shadow">
            <Braces size={18} />
          </div>
          <h1 className="text-lg font-bold text-gray-800 tracking-tight">
            JSON <span className="text-purple-600">Formatter</span>
          </h1>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={loadDemo} 
             className="text-xs font-semibold text-gray-500 hover:text-purple-600 px-4 py-1.5 rounded-full hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
           >
             加载示例
           </button>
           <a 
             href="https://github.com/m9d2/json" 
             target="_blank"
             rel="noreferrer"
             className="bg-gray-900 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow hover:bg-gray-800 transition-transform active:scale-95 flex items-center gap-2"
           >
             <Code2 size={14} /> GitHub
           </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex md:flex-row flex-col overflow-hidden">
        
        {/* Left Pane: Input */}
        <div className="flex-1 flex flex-col border-r border-gray-200 bg-white relative min-w-0 z-10">
          <div className="flex items-center justify-between px-4 h-10 bg-gray-50 border-b border-gray-200 shrink-0">
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider">
                 <FileJson size={14} className="text-gray-400"/>
                 <span>Source</span>
               </div>
               <div className="h-4 w-px bg-gray-300"></div>
               <button 
                  onClick={handleMinifyInput} 
                  className="flex items-center gap-1 text-xs text-gray-600 hover:text-purple-600 hover:bg-white px-2 py-0.5 rounded transition shadow-sm border border-transparent hover:border-gray-200"
                  title="压缩代码"
               >
                  <Minimize2 size={12} /> 压缩
               </button>
               <button 
                  onClick={handleFormatInput} 
                  className="flex items-center gap-1 text-xs text-gray-600 hover:text-purple-600 hover:bg-white px-2 py-0.5 rounded transition shadow-sm border border-transparent hover:border-gray-200"
                  title="美化代码"
               >
                  <Maximize2 size={12} /> 美化
               </button>
            </div>

            <button onClick={handleClear} className="text-gray-400 hover:text-red-500 transition p-1 rounded hover:bg-red-50" title="清空内容">
              <Trash2 size={14} />
            </button>
          </div>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="请在此粘贴 JSON 代码..."
            className="flex-1 w-full p-4 font-mono text-sm resize-none outline-none text-gray-700 bg-white placeholder:text-gray-300 leading-relaxed"
            spellCheck="false"
          />

          {error && (
            <div className="absolute bottom-4 left-4 right-4 bg-red-50 border border-red-100 p-3 rounded-lg text-red-600 text-xs font-mono flex items-start gap-2 shadow-lg animate-in slide-in-from-bottom-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div className="break-all font-medium leading-relaxed">{error}</div>
            </div>
          )}
        </div>

        {/* Right Pane: Output */}
        <div className="flex-1 flex flex-col bg-gray-50 min-w-0 z-0">
          
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 h-10 bg-white border-b border-gray-200 shrink-0">
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider">
                 <Layout size={14} className="text-gray-400"/>
                 <span>Viewer</span>
               </div>
               
               <button 
                  onClick={toggleExpand}
                  className="flex items-center gap-1.5 px-3 py-0.5 rounded text-xs font-medium text-gray-600 bg-gray-100 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 border border-transparent transition-all"
               >
                  {isExpanded ? <ChevronsDown size={14} /> : <ChevronsRight size={14} />}
                  {isExpanded ? '全部折叠' : '全部展开'}
               </button>

               {/* 行号开关 */}
               <button 
                  onClick={() => setShowLineNumbers(!showLineNumbers)}
                  className={`flex items-center gap-1.5 px-3 py-0.5 rounded text-xs font-medium transition-all border ${showLineNumbers ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-gray-100 text-gray-500 border-transparent'}`}
               >
                  <ListOrdered size={14} />
                  行号
               </button>
            </div>

            <button 
              onClick={handleCopy} 
              className={`
                flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all border
                ${copied 
                  ? 'bg-green-50 text-green-600 border-green-200' 
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? '已复制' : '复制结果'}
            </button>
          </div>

          {/* Output Content */}
          <div className={`flex-1 overflow-auto bg-[#fcfcfc] relative scroll-smooth json-tree-view ${showLineNumbers ? 'pl-12' : ''}`}>
            {parsedData ? (
               <div className="p-4 min-w-fit">
                 <JsonCodeNode 
                    key={treeKey} 
                    name={null} 
                    value={parsedData} 
                    isLast={true} 
                    defaultExpanded={isExpanded}
                    showLineNumbers={showLineNumbers}
                 />
               </div>
            ) : (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 select-none pointer-events-none">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <FileJson size={32} className="opacity-40" />
                  </div>
                  <p className="text-sm font-medium">输入有效 JSON 以预览</p>
               </div>
            )}
          </div>
          
          {/* Footer Info */}
          <div className="bg-white border-t border-gray-200 px-4 py-1.5 text-[10px] text-gray-400 flex justify-between shrink-0">
             <div className="flex gap-4">
                <span className="flex items-center gap-1.5">
                   <div className={`w-1.5 h-1.5 rounded-full ${parsedData ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                   {parsedData ? 'Valid' : 'Waiting'}
                </span>
                {parsedData && <span>Nodes: {Array.isArray(parsedData) ? parsedData.length : Object.keys(parsedData).length}</span>}
             </div>
             <span>Size: {input.length.toLocaleString()} chars</span>
          </div>
        </div>

      </main>
    </div>
  );
}
