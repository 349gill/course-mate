import React, { useEffect, useRef } from "react";
import { ReactDiagram } from "gojs-react";
import { initDiagram } from "../utils/utils";

const RenderGraph = ({ nodeDataArray, linkDataArray }) => {
  const diagramRef = useRef();

  useEffect(() => {
    if (diagramRef.current) {
      const diagram = diagramRef.current.getDiagram();
      if (diagram) {
        diagram.addDiagramListener("InitialLayoutCompleted", () => {
          diagram.zoomToFit();
        });
      }
    }
  }, [nodeDataArray, linkDataArray]);

  return (
    <div>
      <ReactDiagram
        ref={diagramRef}
        initDiagram={initDiagram}
        divClassName="diagram-component"
        nodeDataArray={nodeDataArray}
        linkDataArray={linkDataArray}
      />
    </div>
  );
};

export default RenderGraph;
