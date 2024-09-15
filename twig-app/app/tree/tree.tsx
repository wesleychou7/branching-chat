import React, { useRef, useEffect, useState } from "react";
import { Typography, Paper, Button } from "@mui/material";
import RelationGraph, {
  RGOptions,
  RGJsonData,
  RGNode,
  RelationGraphComponent,
} from "relation-graph-react";

const FamilyTreeComponent = () => {
  const graphRef = useRef<RelationGraphComponent>(null);

  const [zoom, setZoom] = useState<number>(100); // a percentage

  const graphOptions: RGOptions = {
    allowShowMiniToolBar: false, // disable tool bar
    defaultJunctionPoint: "tb", // top, bottom
    defaultNodeShape: 1, // rectangle
    disableNodeClickEffect: true,
    disableLineClickEffect: true,
    defaultLineWidth: 2,
    defaultLineShape: 2, // curvy line
    disableDragNode: true, // disable dragging nodes
    disableZoom: true, // disable mousewheel zooming
    layout: {
      layoutName: "tree",
      from: "top", // from top to bottom
    },
  };

  const familyData: RGJsonData = {
    rootId: "grandparent",
    nodes: [
      { id: "grandparent", text: "grand" },
      { id: "parent1", text: "Parent 1" },
      { id: "parent2", text: "Parent 2" },
      { id: "child1", text: "Child 1" },
      { id: "child2", text: "Child 2" },
      { id: "child3", text: "Child 3" },
      { id: "grandchild1", text: "Grandchild 1" },
      { id: "grandchild2", text: "Grandchild 2" },
    ],
    lines: [
      { from: "grandparent", to: "parent1", color: "red" },
      { from: "grandparent", to: "parent2" },
      { from: "parent1", to: "child1" },
      { from: "parent1", to: "child2" },
      { from: "parent2", to: "child3" },
      { from: "child1", to: "grandchild1" },
      { from: "child1", to: "grandchild2" },
    ],
  };

  // initialize graph and set options
  useEffect(() => {
    const graphInstance = graphRef.current?.getInstance();
    if (graphInstance) {
      graphInstance.setJsonData(familyData);
      graphInstance.setOptions(graphOptions);
      graphInstance.moveToCenter();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      onZoomChange(event);
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  //
  const onZoomChange = (event: KeyboardEvent) => {
    const graphInstance = graphRef.current?.getInstance();
    if (graphInstance) {
      if (event.key === "d") {
        setZoom((prevZoom) => prevZoom - 20);
      } else if (event.key === "f") {
        setZoom((prevZoom) => prevZoom + 20);
      }
    }
  };

  const setGraphZoom = () => {
    const graphInstance = graphRef.current?.getInstance();
    if (graphInstance) {
      graphInstance.setZoom(zoom);
    }
  };
  useEffect(() => {
    setGraphZoom();
  }, [zoom]);

  const NodeSlot: React.FC<{ node: RGNode }> = ({ node }) => {
    return <Button>{node.text}</Button>;
  };

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <div>{zoom}</div>
      <RelationGraph
        ref={graphRef}
        options={graphOptions}
        nodeSlot={NodeSlot}
      />
    </div>
  );
};

export default FamilyTreeComponent;
