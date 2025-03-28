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
    
    // Validate that no boxes overlap
    this.validateNoOverlaps();
    
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
      
      // Check for collisions before placing the box, pass the shape type
      if (this.wouldBoxOverlap(position, [bestBoxDims[0]/100, bestBoxDims[1]/100, bestBoxDims[2]/100], undefined, box.shape)) {
        console.warn("Collision detected during placement, skipping box:", box);
        return false;
      }

      // Only add if no collision detected
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
        
        // Convert dimensions to meters for collision check
        const dimsMeter: Vector3D = [
          dims[0]/100, 
          dims[1]/100, 
          dims[2]/100
        ];
        
        // Try moving the box down gradually
        const currentY = box.position[1];
        let newY = currentY;
        const yIncrement = 0.005; // 0.5cm increments for faster processing
        
        while (true) {
          // Calculate potential new position
          const testPosition: Vector3D = [
            box.position[0], 
            newY - yIncrement, 
            box.position[2]
          ];
          
          // Stop if we've reached the container bottom
          if (testPosition[1] - dimsMeter[1]/2 <= this.containerBottom) {
            newY = this.containerBottom + dimsMeter[1]/2;
            break;
          }
          
          // Check for collision with this test position
          if (this.wouldBoxOverlap(testPosition, dimsMeter, box)) {
            break; // Collision found, stop moving down
          }
          
          // Move down more
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

  /**
   * Check if a box at the given position and dimensions would overlap with any existing boxes
   */
  private wouldBoxOverlap(
    position: Vector3D,
    boxDims: Vector3D,
    excludeBox?: PackedBox,
    boxType: 'box' | 'cylinder' | 'sphere' = 'box'
  ): boolean {
    // Check collision with each existing box
    for (const packedBox of this.packed) {
      // Skip if this is the box we're testing
      if (excludeBox && packedBox === excludeBox) continue;
      
      const otherDims = getRotatedDimensions(packedBox.box, packedBox.rotation);
      const otherPos = packedBox.position;
      const otherType = packedBox.box.shape || 'box';
      
      // Get dimensions in consistent units (meters)
      const boxWidth = boxDims[0];
      const boxHeight = boxDims[1]; 
      const boxDepth = boxDims[2];
      
      // Convert otherDims from cm to meters
      const otherWidth = otherDims[0] / 100;
      const otherHeight = otherDims[1] / 100;
      const otherDepth = otherDims[2] / 100;
      
      // Calculate buffer based on shape types
      let bufferX = 0;
      let bufferY = 0;
      let bufferZ = 0;
      
      // Add extra buffer for cylinders and spheres
      if (boxType === 'cylinder' || otherType === 'cylinder') {
        bufferX += 0.01; // 1cm buffer for cylinders
        bufferZ += 0.01;
      }
      
      if (boxType === 'sphere' || otherType === 'sphere') {
        bufferX += 0.005; // 0.5cm buffer for spheres
        bufferY += 0.005;
        bufferZ += 0.005;
      }
      
      // Check for overlap in all 3 dimensions with buffers
      const overlapX = Math.abs(position[0] - otherPos[0]) < (boxWidth + otherWidth) / 2 + bufferX;
      const overlapY = Math.abs(position[1] - otherPos[1]) < (boxHeight + otherHeight) / 2 + bufferY;
      const overlapZ = Math.abs(position[2] - otherPos[2]) < (boxDepth + otherDepth) / 2 + bufferZ;
      
      if (overlapX && overlapY && overlapZ) {
        return true; // Overlap detected
      }
    }
    
    return false; // No overlap
  }

  /**
   * Validate that no boxes overlap and fix any issues
   */
  private validateNoOverlaps(): void {
    let correctionsMade = 0;
    const maxCorrections = 20; // Fewer max corrections
    let overlapsFound = true;
    
    // Keep correcting until no overlaps are found or max corrections reached
    while (overlapsFound && correctionsMade < maxCorrections) {
      overlapsFound = false;
      
      // Check each pair of boxes for overlap
      for (let i = 0; i < this.packed.length; i++) {
        for (let j = i + 1; j < this.packed.length; j++) {
          const boxA = this.packed[i];
          const boxB = this.packed[j];
          
          // Get dimensions in meters
          const dimsA = getRotatedDimensions(boxA.box, boxA.rotation);
          const boxDimsA: Vector3D = [dimsA[0]/100, dimsA[1]/100, dimsA[2]/100];
          const dimsB = getRotatedDimensions(boxB.box, boxB.rotation);
          const boxDimsB: Vector3D = [dimsB[0]/100, dimsB[1]/100, dimsB[2]/100];
          
          // Check if boxes overlap
          if (this.checkSpecificOverlap(boxA.position, boxDimsA, boxB.position, boxDimsB)) {
            overlapsFound = true;
            correctionsMade++;
            
            // Find axis with minimum overlap and separate along that axis
            const [separationAxis, separationAmount] = this.findMinimumSeparation(
              boxA.position, boxDimsA, 
              boxB.position, boxDimsB
            );
            
            // Move boxB along the separation axis - more gentle movement
            boxB.position[separationAxis] += separationAmount + 0.002; // Add 2mm extra space
          }
        }
      }
    }
  }

  /**
   * Check if two specific boxes overlap
   */
  private checkSpecificOverlap(
    posA: Vector3D, dimsA: Vector3D, 
    posB: Vector3D, dimsB: Vector3D
  ): boolean {
    // Much smaller safety margin
    const safetyMargin = 0.0002; 
    
    // Check overlap on each axis - subtract safety margin instead of adding
    const overlapX = Math.abs(posA[0] - posB[0]) < (dimsA[0] + dimsB[0]) / 2 - safetyMargin;
    const overlapY = Math.abs(posA[1] - posB[1]) < (dimsA[1] + dimsB[1]) / 2 - safetyMargin;
    const overlapZ = Math.abs(posA[2] - posB[2]) < (dimsA[2] + dimsB[2]) / 2 - safetyMargin;
    
    return overlapX && overlapY && overlapZ;
  }

  /**
   * Find the axis with minimum separation needed and return [axis, amount]
   */
  private findMinimumSeparation(
    posA: Vector3D, dimsA: Vector3D, 
    posB: Vector3D, dimsB: Vector3D
  ): [number, number] {
    // Calculate overlap on each axis
    const overlapX = (dimsA[0] + dimsB[0]) / 2 - Math.abs(posA[0] - posB[0]);
    const overlapY = (dimsA[1] + dimsB[1]) / 2 - Math.abs(posA[1] - posB[1]);
    const overlapZ = (dimsA[2] + dimsB[2]) / 2 - Math.abs(posA[2] - posB[2]);
    
    // Find minimum positive overlap
    let minOverlap = Infinity;
    let axis = 0;
    
    if (overlapX > 0 && overlapX < minOverlap) {
      minOverlap = overlapX;
      axis = 0;
    }
    
    if (overlapY > 0 && overlapY < minOverlap) {
      minOverlap = overlapY;
      axis = 1;
    }
    
    if (overlapZ > 0 && overlapZ < minOverlap) {
      minOverlap = overlapZ;
      axis = 2;
    }
    
    // Determine direction (positive or negative)
    const direction = posB[axis] > posA[axis] ? 1 : -1;
    
    return [axis, minOverlap * direction];
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