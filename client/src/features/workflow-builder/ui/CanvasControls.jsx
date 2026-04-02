import { useReactFlow } from '@xyflow/react';
import { useDispatch } from 'react-redux';
import { clearBuilderError, setNodes, setEdges } from '@/redux/builder';
import { Button } from '@/shared/ui/button';
import { ZoomIn, ZoomOut, Maximize, Trash2 } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip';

export function CanvasControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const dispatch = useDispatch();

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear the canvas? All unsaved work will be lost.")) {
      dispatch(setNodes([]));
      dispatch(setEdges([]));
      dispatch(clearBuilderError());
    }
  };

  return (
    <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2 bg-background border rounded-md shadow-sm p-1">
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => zoomIn()}>
              <ZoomIn className="h-4 w-4 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right"><p>Zoom In</p></TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => zoomOut()}>
              <ZoomOut className="h-4 w-4 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right"><p>Zoom Out</p></TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => fitView({ padding: 0.2 })}>
                <Maximize className="h-4 w-4 text-muted-foreground" />
             </Button>
          </TooltipTrigger>
          <TooltipContent side="right"><p>Fit to Screen</p></TooltipContent>
        </Tooltip>

        <div className="h-px bg-border my-1" />

        <Tooltip>
          <TooltipTrigger asChild>
             <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive hover:bg-destructive/10" onClick={handleClear}>
               <Trash2 className="h-4 w-4" />
             </Button>
          </TooltipTrigger>
          <TooltipContent side="right"><p>Clear Canvas</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
