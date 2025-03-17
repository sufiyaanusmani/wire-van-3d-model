import { BoxData } from "@/app/components/forms/BoxForm";
import { BoxWithColor } from "./store";

// Vector3D type for positions and dimensions
type Vector3D = [number, number, number];

// Box with position information for packing
interface PackedBox {
  box: BoxWithColor;
  position: Vector3D; // [x, y, z] coordinates
  rotation: number;   // 0-5 for the 6 possible orientations
}

// Space representation for available spaces
interface Space {
  position: Vector3D;
  size: Vector3D;
}

/**
 * Main bin packing algorithm class
 */
export class BinPacker {
  private container: Vector3D;
  private packed: PackedBox[] = [];
  private spaces: Space[] = [];
  private containerBottom: number;
  
  /**
   * Create a new bin packer
   * @param width Container width
   * @param height Container height
   * @param depth Container depth
   */
  constructor(width: number, height: number, depth: number) {
    // Convert dimensions to meters for the 3D model
    this.container = [depth / 100, height / 100, width / 100];
    
    // Calculate the container bottom Y coordinate
    this.containerBottom = -this.container[1] / 2;
    
    // Initialize with a single space representing the entire container
    this.spaces = [
      {
        position: [-this.container[0] / 2, this.containerBottom, -this.container[2] / 2],
        size: [...this.container]
      }
    ];
  }
  
  /**
   * Pack boxes into the container
   * @param boxes Array of boxes to pack
   * @returns Array of packed boxes with position and rotation information
   */
  pack(boxes: BoxWithColor[]): PackedBox[] {
    this.packed = [];
    
    // Sort boxes by volume (largest first)
    const sortedBoxes = [...boxes].sort((a, b) => {
      const volumeA = a.length * a.width * a.height;
      const volumeB = b.length * b.width * b.height;
      return volumeB - volumeA;
    });
    
    // Try to pack each box
    for (const box of sortedBoxes) {
      this.packBox(box);
    }
    
    // Apply gravity to make sure no boxes are floating
    this.applyGravity();
    
    return this.packed;
  }
  
  /**
   * Try to pack a single box into the container
   * @param box Box to pack
   * @returns True if the box was successfully packed
   */
  private packBox(box: BoxWithColor): boolean {
    // Box dimensions in meters
    const boxDims: Vector3D[] = [
      [box.length / 100, box.height / 100, box.width / 100], // Original orientation
      [box.width / 100, box.height / 100, box.length / 100], // Rotated 90° around Y
      [box.length / 100, box.width / 100, box.height / 100], // Rotated 90° around X
      [box.height / 100, box.length / 100, box.width / 100], // Rotated 90° around X, then 90° around Z
      [box.width / 100, box.length / 100, box.height / 100], // Rotated 90° around X, then 90° around Y
      [box.height / 100, box.width / 100, box.length / 100], // Rotated 90° around Z
    ];
    
    let bestSpace: Space | null = null;
    let bestScore = Infinity;
    let bestBoxDims: Vector3D = [0, 0, 0];
    let bestRotation = 0;
    
    // First try to find placements on the ground or on top of other boxes
    for (let i = 0; i < this.spaces.length; i++) {
      const space = this.spaces[i];
      
      for (let r = 0; r < boxDims.length; r++) {
        const dims = boxDims[r];
        
        // Check if box fits in this space with this orientation
        if (
          dims[0] <= space.size[0] &&
          dims[1] <= space.size[1] &&
          dims[2] <= space.size[2]
        ) {
          // Check if this is a stable position (on ground or on another box)
          const isOnGround = Math.abs(space.position[1] - this.containerBottom) < 0.001;
          const isOnAnotherBox = this.isPositionSupported(
            space.position[0], 
            space.position[1], 
            space.position[2],
            dims[0],
            dims[2]
          );
          
          if (isOnGround || isOnAnotherBox) {
            // Score this placement (lower is better)
            // Prioritize ground placements and positions closer to the origin
            let score = 
              Math.pow(space.position[0], 2) + 
              Math.pow(space.position[2], 2);
              
            // Heavy preference for lower Y positions
            score += space.position[1] * 10;
            
            if (score < bestScore) {
              bestScore = score;
              bestSpace = space;
              bestBoxDims = dims;
              bestRotation = r;
            }
          }
        }
      }
    }
    
    // If we couldn't find a stable position, look for any valid position
    if (bestSpace === null) {
      for (let i = 0; i < this.spaces.length; i++) {
        const space = this.spaces[i];
        
        for (let r = 0; r < boxDims.length; r++) {
          const dims = boxDims[r];
          
          // Check if box fits in this space with this orientation
          if (
            dims[0] <= space.size[0] &&
            dims[1] <= space.size[1] &&
            dims[2] <= space.size[2]
          ) {
            // Score this placement (lower is better)
            const score = 
              Math.pow(space.position[0], 2) + 
              Math.pow(space.position[1], 2) + 
              Math.pow(space.position[2], 2);
            
            if (score < bestScore) {
              bestScore = score;
              bestSpace = space;
              bestBoxDims = dims;
              bestRotation = r;
            }
          }
        }
      }
    }
    
    // If we found a valid placement
    if (bestSpace) {
      // Calculate the box position (center of the box)
      const position: Vector3D = [
        bestSpace.position[0] + bestBoxDims[0] / 2,
        bestSpace.position[1] + bestBoxDims[1] / 2,
        bestSpace.position[2] + bestBoxDims[2] / 2
      ];
      
      // Add the box to our packed list
      this.packed.push({
        box,
        position,
        rotation: bestRotation
      });
      
      // Remove the used space
      this.spaces = this.spaces.filter(s => s !== bestSpace);
      
      // Split the space into new spaces
      this.splitSpace(bestSpace, bestBoxDims);
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Check if a position is supported by another box
   */
  private isPositionSupported(x: number, y: number, z: number, width: number, depth: number): boolean {
    // For each packed box, check if it supports this position
    for (const packedBox of this.packed) {
      const box = packedBox.box;
      const rotation = packedBox.rotation;
      const boxPos = packedBox.position;
      
      // Get the rotated dimensions
      const dims = getRotatedDimensions(box, rotation);
      const boxWidth = dims[0] / 100;
      const boxHeight = dims[1] / 100;
      const boxDepth = dims[2] / 100;
      
      // Calculate the top of the box
      const boxTop = boxPos[1] + boxHeight / 2;
      
      // Check if this new position is directly above this box
      if (Math.abs(boxTop - y) < 0.001) {
        // Calculate box extents
        const boxLeft = boxPos[0] - boxWidth / 2;
        const boxRight = boxPos[0] + boxWidth / 2;
        const boxBack = boxPos[2] - boxDepth / 2;
        const boxFront = boxPos[2] + boxDepth / 2;
        
        // Calculate new position extents
        const newLeft = x;
        const newRight = x + width;
        const newBack = z;
        const newFront = z + depth;
        
        // Check for overlap
        if (
          newRight > boxLeft && newLeft < boxRight &&
          newFront > boxBack && newBack < boxFront
        ) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  /**
   * Apply gravity to all boxes to make them rest on a surface
   */
  private applyGravity(): void {
    let changed = true;
    
    // Continue until no more boxes can be moved down
    while (changed) {
      changed = false;
      
      for (let i = 0; i < this.packed.length; i++) {
        const box = this.packed[i];
        const dims = getRotatedDimensions(box.box, box.rotation);
        const boxHeight = dims[1] / 100;
        const boxWidth = dims[0] / 100;
        const boxDepth = dims[2] / 100;
        
        // Try to move the box down until it hits something
        const currentY = box.position[1];
        let newY = currentY;
        const yIncrement = 0.01; // 1cm increments
        
        while (true) {
          // Calculate bottom of box
          const boxBottom = newY - boxHeight / 2;
          
          // Stop if we've reached the container bottom
          if (boxBottom <= this.containerBottom) {
            newY = this.containerBottom + boxHeight / 2;
            break;
          }
          
          // See if the box would collide with any other box
          let collision = false;
          for (let j = 0; j < this.packed.length; j++) {
            if (i === j) continue; // Skip self
            
            const otherBox = this.packed[j];
            const otherDims = getRotatedDimensions(otherBox.box, otherBox.rotation);
            const otherWidth = otherDims[0] / 100;
            const otherHeight = otherDims[1] / 100;
            const otherDepth = otherDims[2] / 100;
            
            // Check for collision
            if (
              Math.abs((newY - boxHeight / 2) - (otherBox.position[1] + otherHeight / 2)) < 0.001 &&
              box.position[0] + boxWidth / 2 > otherBox.position[0] - otherWidth / 2 &&
              box.position[0] - boxWidth / 2 < otherBox.position[0] + otherWidth / 2 &&
              box.position[2] + boxDepth / 2 > otherBox.position[2] - otherDepth / 2 &&
              box.position[2] - boxDepth / 2 < otherBox.position[2] + otherDepth / 2
            ) {
              collision = true;
              break;
            }
          }
          
          if (collision) {
            break;
          }
          
          // Try moving down more
          newY -= yIncrement;
        }
        
        // If we found a lower position, update it
        if (newY < currentY) {
          box.position[1] = newY;
          changed = true;
        }
      }
    }
  }
  
  /**
   * Split a space after placing a box into it
   * @param space The space being split
   * @param boxSize The size of the box placed
   */
  private splitSpace(space: Space, boxSize: Vector3D): void {
    // Create new spaces by splitting along each axis
    const newSpaces: Space[] = [
      // Space to the right of the box
      {
        position: [
          space.position[0] + boxSize[0],
          space.position[1],
          space.position[2]
        ],
        size: [
          space.size[0] - boxSize[0],
          boxSize[1],
          boxSize[2]
        ]
      },
      // Space above the box
      {
        position: [
          space.position[0],
          space.position[1] + boxSize[1],
          space.position[2]
        ],
        size: [
          space.size[0],
          space.size[1] - boxSize[1],
          space.size[2]
        ]
      },
      // Space to the back of the box
      {
        position: [
          space.position[0],
          space.position[1],
          space.position[2] + boxSize[2]
        ],
        size: [
          space.size[0],
          space.size[1],
          space.size[2] - boxSize[2]
        ]
      }
    ];
    
    // Add valid spaces (with positive dimensions)
    for (const newSpace of newSpaces) {
      if (
        newSpace.size[0] > 0.001 &&
        newSpace.size[1] > 0.001 &&
        newSpace.size[2] > 0.001
      ) {
        this.spaces.push(newSpace);
      }
    }
    
    // Merge spaces if possible to reduce fragmentation
    this.mergeSpaces();
  }
  
  /**
   * Merge spaces that can be combined to reduce fragmentation
   */
  private mergeSpaces(): void {
    let merged = true;
    
    while (merged) {
      merged = false;
      for (let i = 0; i < this.spaces.length; i++) {
        for (let j = i + 1; j < this.spaces.length; j++) {
          const mergeResult = this.tryMerge(i, j);
          if (mergeResult) {
            merged = true;
            break;
          }
        }
        if (merged) break;
      }
    }
  }
  
  /**
   * Try to merge two spaces
   * @param i Index of first space
   * @param j Index of second space
   * @returns True if spaces were merged
   */
  private tryMerge(i: number, j: number): boolean {
    const a = this.spaces[i];
    const b = this.spaces[j];
    
    // Check if spaces can be merged along X axis
    if (
      Math.abs(a.position[1] - b.position[1]) < 0.001 &&
      Math.abs(a.position[2] - b.position[2]) < 0.001 &&
      Math.abs(a.size[1] - b.size[1]) < 0.001 &&
      Math.abs(a.size[2] - b.size[2]) < 0.001
    ) {
      if (Math.abs(a.position[0] + a.size[0] - b.position[0]) < 0.001) {
        a.size[0] += b.size[0];
        this.spaces.splice(j, 1);
        return true;
      } else if (Math.abs(b.position[0] + b.size[0] - a.position[0]) < 0.001) {
        a.position[0] = b.position[0];
        a.size[0] += b.size[0];
        this.spaces.splice(j, 1);
        return true;
      }
    }
    
    // Check if spaces can be merged along Y axis
    if (
      Math.abs(a.position[0] - b.position[0]) < 0.001 &&
      Math.abs(a.position[2] - b.position[2]) < 0.001 &&
      Math.abs(a.size[0] - b.size[0]) < 0.001 &&
      Math.abs(a.size[2] - b.size[2]) < 0.001
    ) {
      if (Math.abs(a.position[1] + a.size[1] - b.position[1]) < 0.001) {
        a.size[1] += b.size[1];
        this.spaces.splice(j, 1);
        return true;
      } else if (Math.abs(b.position[1] + b.size[1] - a.position[1]) < 0.001) {
        a.position[1] = b.position[1];
        a.size[1] += b.size[1];
        this.spaces.splice(j, 1);
        return true;
      }
    }
    
    // Check if spaces can be merged along Z axis
    if (
      Math.abs(a.position[0] - b.position[0]) < 0.001 &&
      Math.abs(a.position[1] - b.position[1]) < 0.001 &&
      Math.abs(a.size[0] - b.size[0]) < 0.001 &&
      Math.abs(a.size[1] - b.size[1]) < 0.001
    ) {
      if (Math.abs(a.position[2] + a.size[2] - b.position[2]) < 0.001) {
        a.size[2] += b.size[2];
        this.spaces.splice(j, 1);
        return true;
      } else if (Math.abs(b.position[2] + b.size[2] - a.position[2]) < 0.001) {
        a.position[2] = b.position[2];
        a.size[2] += b.size[2];
        this.spaces.splice(j, 1);
        return true;
      }
    }
    
    return false;
  }
}

/**
 * Helper function to pack boxes in a van
 * @param boxes Boxes to pack
 * @param vanDimensions Van dimensions
 * @returns Packed boxes with position information
 */
export function packBoxesInVan(
  boxes: BoxWithColor[],
  vanDimensions: { width: number, height: number, depth: number }
): {
  box: BoxWithColor;
  position: Vector3D;
  rotation: number;
}[] {
  const packer = new BinPacker(
    vanDimensions.width,
    vanDimensions.height,
    vanDimensions.depth
  );
  
  return packer.pack(boxes);
}

/**
 * Get rotated dimensions based on rotation index
 * @param box Original box
 * @param rotation Rotation index (0-5)
 * @returns Rotated dimensions [length, height, width]
 */
export function getRotatedDimensions(
  box: BoxData,
  rotation: number
): Vector3D {
  switch (rotation) {
    case 0: return [box.length, box.height, box.width]; // Original
    case 1: return [box.width, box.height, box.length]; // Rotate 90° around Y
    case 2: return [box.length, box.width, box.height]; // Rotate 90° around X
    case 3: return [box.height, box.length, box.width]; // Rotate 90° around X, then 90° around Z
    case 4: return [box.width, box.length, box.height]; // Rotate 90° around X, then 90° around Y
    case 5: return [box.height, box.width, box.length]; // Rotate 90° around Z
    default: return [box.length, box.height, box.width];
  }
}