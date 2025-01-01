import { Ok, Err, Throwable } from '@typ3/throwable'

import { MateriaType } from "./Arti";


async function TagReasm(materia: MateriaType, tags: Set<string>): Promise<Map<string, MateriaType>> {
  let ret: Map<string, MateriaType> = new Map();

  binTreeBorn(materia)





  return new Map()
}

// construct binarya trree
function binTreeBorn(materia: MateriaType): Throwable<Map<string, MateriaType>> {
  let root = buildFrequencyTree(materia);

  if (root) {
    // console.log("Frequency Tree:");
    // printTree(root.unwrap());

    const height2Nodes = findNodesAtHeight(root.unwrap(), 2);
    if (height2Nodes.length > 0) {
      console.log("\nNodes at height 2:")
      for (const node of height2Nodes) {
        console.log(`  ${node.value} (${node.frequency})`);
      }
    } else {
      console.log("\nNo nodes found at height 2.")
    }
  } else {
    console.log("No tags found in the data.");
  }

  const noTagEntries = materia.filter(item => item.tags.length === 0).map(item => item.title);
  if (noTagEntries.length > 0) {
    console.log("\nEntries without tags:");
    console.log(noTagEntries);
  }

  // console.log(root)

  return Ok(new Map())
}

class Node {
  value: string;
  frequency: number;
  left: Node | null;
  right: Node | null;

  constructor(value: string, frequency: number = 0) {
    this.value = value;
    this.frequency = frequency;
    this.left = null;
    this.right = null;
  }
}

interface DataItem {
  title: string;
  tags: string[];
}

function buildFrequencyTree(data: MateriaType): Throwable<Node, null | undefined> {
  const tagCounts: { [tag: string]: number } = {};

  for (const item of data) {
    for (const tag of item.tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }

  const nodes: Node[] = [];
  for (const tag in tagCounts) {
    nodes.push(new Node(tag, tagCounts[tag]));
  }

  if (nodes.length === 0) {
    return Err(null);
  }

  while (nodes.length > 1) {
    nodes.sort((a, b) => a.frequency - b.frequency);

    const left = nodes.shift()!; // ! 断言 nodes.shift() 不会返回 undefined
    const right = nodes.shift()!;

    const mergedNode = new Node(`${left.value}+${right.value}`, left.frequency + right.frequency);
    mergedNode.left = left;
    mergedNode.right = right;

    nodes.push(mergedNode);
  }

  return Ok(nodes[0]);
}

function printTree(root: Node | null, indent: string = ""): void {
  if (root) {
    console.log(indent + `${root.value} (${root.frequency})`);
    printTree(root.left, indent + "  ");
    printTree(root.right, indent + "  ");
  }
}

function getHeight(node: Node | null): number {
  if (!node) {
    return -1;
  }
  return 1 + Math.max(getHeight(node.left), getHeight(node.right));
}

function findNodesAtHeight(root: Node | null, targetHeight: number): Node[] {
  if (!root) {
    return [];
  }

  const nodesAtHeight: Node[] = [];
  if (getHeight(root) === targetHeight) {
    nodesAtHeight.push(root);
  }

  nodesAtHeight.push(...findNodesAtHeight(root.left, targetHeight));
  nodesAtHeight.push(...findNodesAtHeight(root.right, targetHeight));

  return nodesAtHeight;
}
export default TagReasm;
