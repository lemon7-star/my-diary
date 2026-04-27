import { useRef, useState, useEffect, useCallback } from 'react';
import { Eraser, Trash2, Circle, Undo2, Paintbrush } from 'lucide-react';

interface DrawingCanvasProps {
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
}

const COLORS = [
  { name: '黑色', value: '#000000' },
  { name: '红色', value: '#EF4444' },
  { name: '蓝色', value: '#3B82F6' },
  { name: '绿色', value: '#22C55E' },
  { name: '橙色', value: '#F97316' },
  { name: '紫色', value: '#8B5CF6' },
];

const BRUSH_SIZES = [
  { name: '细', value: 2 },
  { name: '中', value: 5 },
  { name: '粗', value: 10 },
];

const ERASER_SIZES = [
  { name: '小', value: 10 },
  { name: '中', value: 20 },
  { name: '大', value: 40 },
];

// 历史记录最大步数
const MAX_HISTORY = 20;

export function DrawingCanvas({ onSave, onCancel }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [customColor, setCustomColor] = useState('#FF69B4');
  const [brushSize, setBrushSize] = useState(5);
  const [eraserSize, setEraserSize] = useState(20);
  const [isEraser, setIsEraser] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // 历史记录用于撤销
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // 保存当前画布状态到历史记录
  const saveHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    setHistory(prev => {
      // 删除当前步骤之后的历史
      const newHistory = prev.slice(0, historyStep + 1);
      newHistory.push(imageData);

      // 限制历史记录数量
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
      }

      return newHistory;
    });

    setHistoryStep(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [historyStep]);

  // 初始化画布
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置白色背景
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 保存初始状态
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([imageData]);
    setHistoryStep(0);
  }, []);

  const getCoordinates = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  }, [getCoordinates]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.lineWidth = isEraser ? eraserSize : brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (isEraser) {
      ctx.strokeStyle = '#FFFFFF';
    } else {
      ctx.strokeStyle = color;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  }, [isDrawing, brushSize, eraserSize, color, isEraser, getCoordinates]);

  const stopDrawing = useCallback(() => {
    if (isDrawing) {
      saveHistory();
    }
    setIsDrawing(false);
  }, [isDrawing, saveHistory]);

  const undo = useCallback(() => {
    if (historyStep <= 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newStep = historyStep - 1;
    const imageData = history[newStep];

    if (imageData) {
      ctx.putImageData(imageData, 0, 0);
      setHistoryStep(newStep);

      // 如果撤销到初始状态，重置 hasDrawn
      if (newStep === 0) {
        setHasDrawn(false);
      }
    }
  }, [history, historyStep]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    saveHistory();
  }, [saveHistory]);

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;

    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  }, [hasDrawn, onSave]);

  const handleColorSelect = (colorValue: string) => {
    setColor(colorValue);
    setIsEraser(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    setColor(newColor);
    setIsEraser(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* 工具栏 */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-xl mb-3">
        {/* 颜色选择 */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">颜色</span>
          <div className="flex gap-1">
            {COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => handleColorSelect(c.value)}
                className={`w-7 h-7 rounded-full border-2 transition-all ${
                  color === c.value && !isEraser
                    ? 'border-gray-600 scale-110'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
            {/* 自定义颜色选择器 */}
            <label
              className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer relative overflow-hidden ${
                !COLORS.some(c => c.value === color) && !isEraser
                  ? 'border-gray-600 scale-110'
                  : 'border-transparent hover:scale-105'
              }`}
              style={{ background: 'linear-gradient(45deg, #ff0000, #00ff00, #0000ff, #ffff00, #ff00ff, #00ffff)' }}
              title="自定义颜色"
            >
              <input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Paintbrush className="w-3 h-3 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-md" />
            </label>
          </div>
        </div>

        {/* 画笔粗细 - 只在非橡皮擦模式显示 */}
        {!isEraser && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">粗细</span>
            <div className="flex gap-1">
              {BRUSH_SIZES.map((size) => (
                <button
                  key={size.value}
                  onClick={() => setBrushSize(size.value)}
                  className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                    brushSize === size.value
                      ? 'bg-theme text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {size.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 橡皮擦 */}
        <button
          onClick={() => setIsEraser(!isEraser)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            isEraser
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Eraser className="w-4 h-4" />
          橡皮
        </button>

        {/* 橡皮擦大小 - 只在橡皮擦模式显示 */}
        {isEraser && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">大小</span>
            <div className="flex gap-1">
              {ERASER_SIZES.map((size) => (
                <button
                  key={size.value}
                  onClick={() => setEraserSize(size.value)}
                  className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                    eraserSize === size.value
                      ? 'bg-yellow-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {size.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 撤销 */}
        <button
          onClick={undo}
          disabled={historyStep <= 0}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-white text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Undo2 className="w-4 h-4" />
          撤销
        </button>

        {/* 清空 */}
        <button
          onClick={clearCanvas}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-red-600 bg-white hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          清空
        </button>
      </div>

      {/* 画布区域 - 固定高度 */}
      <div className="bg-gray-100 rounded-xl overflow-hidden relative flex-1 min-h-[380px]">
        <canvas
          ref={canvasRef}
          width={320}
          height={320}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-sm cursor-crosshair touch-none"
          style={{ touchAction: 'none' }}
        />
      </div>

      {/* 预览提示 */}
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <Circle className={`w-2 h-2 ${isEraser ? 'text-yellow-500' : 'text-theme'}`} fill="currentColor" />
          <span>
            {isEraser
              ? `橡皮擦: ${ERASER_SIZES.find(s => s.value === eraserSize)?.name}`
              : `画笔: ${COLORS.find(c => c.value === color)?.name || '自定义'} ${BRUSH_SIZES.find(s => s.value === brushSize)?.name}`
            }
          </span>
        </div>
        <span>320 x 320</span>
      </div>

      {/* 按钮 - 固定在底部 */}
      <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
        >
          取消
        </button>
        <button
          onClick={handleSave}
          disabled={!hasDrawn}
          className="flex-1 px-4 py-3 bg-theme text-white rounded-xl hover:bg-theme-hover transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          插入
        </button>
      </div>
    </div>
  );
}
