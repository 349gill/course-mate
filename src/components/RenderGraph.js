import React, { useEffect, useRef } from "react";
import { ReactDiagram } from "gojs-react";
import { initDiagram } from "../utils/utils";

const RenderGraph = ({ nodeDataArray, linkDataArray }) => {
  const diagramRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    if (diagramRef.current) {
      const diagram = diagramRef.current.getDiagram();
      if (diagram) {
        // Add zoom control listener
        diagram.addDiagramListener("InitialLayoutCompleted", () => {
          diagram.zoomToFit();
          
          // Optional: Set minimum and maximum zoom levels
          if (diagram.scale < 0.25) diagram.scale = 0.25;
          if (diagram.scale > 2) diagram.scale = 2;
        });

        // Handle window resize
        const handleResize = () => {
          if (containerRef.current) {
            const containerWidth = containerRef.current.clientWidth;
            diagram.div.style.width = `${containerWidth}px`;
            diagram.zoomToFit();
            diagram.requestUpdate();
          }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial size adjustment

        return () => window.removeEventListener('resize', handleResize);
      }
    }
  }, [nodeDataArray, linkDataArray]);

  return (
    <div 
      ref={containerRef} 
      className="w-full border-2 border-gray-300 rounded-lg overflow-hidden"
      style={{ height: '500px' }}
    >
      <ReactDiagram
        ref={diagramRef}
        initDiagram={initDiagram}
        divClassName="diagram-component h-full w-full"
        nodeDataArray={nodeDataArray}
        linkDataArray={linkDataArray}
      />
    </div>
  );
};

export default RenderGraph;