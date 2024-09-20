import React, { useRef, useEffect, useState } from "react";
import { Typography, Paper, Button } from "@mui/material";
import Box from "@mui/material/Box";
import RelationGraph, {
  RGOptions,
  RGJsonData,
  RGNode,
  RelationGraphComponent,
} from "relation-graph-react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/app/store";
import { addNode } from "./treeSlice";
import Node from "./Node";

const Tree = () => {
  const dispatch = useDispatch();
  const nodes = useSelector((state: RootState) => state.tree.nodes);
  const lines = useSelector((state: RootState) => state.tree.lines);

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
    nodes: nodes,
    lines: lines,
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

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
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
    return <Node id={node.id} text={node.text} />;
  };

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <RelationGraph
        ref={graphRef}
        options={graphOptions}
        nodeSlot={NodeSlot}
      />
    </div>
  );
};

export default Tree;
