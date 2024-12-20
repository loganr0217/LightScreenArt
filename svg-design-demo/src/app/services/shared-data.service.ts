import { Injectable } from '@angular/core';
import { DividerWindow, SVGTemplate } from '../components/svgScaler';
import { Polygon } from '../components/svgScaler';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  currentPaneID:string = "";
  numberPanes:number = 0;
  currentPaneColor:string = "";
  currentSelectedColor:{id:number, name:string, hex:string, darkHex:string, paneColor:boolean, isAvailable:boolean, placementID:number, opacity:number, darkOpacity:number};
  currentFilamentColor:string = "666666";
  currentSvgTemplate:SVGTemplate;
  dividerWindow:DividerWindow;
  currentTemplateNumber:number = -1;
  currentWindowNumber:number;
  maxPanes:number = 100;
  selectedDividerType:string = "nodiv";
  selectedWindowShape:string = "unselected";
  colorModeSelected:string = "";
  dividerNumbers:number[] = [0, 0]; // [horizontalDividers, verticalDividers]
  dividerWidth:number = 0;
  windowWidth:number = 0;
  windowHeight:number = 0;
  bottomSashWidth:number = -1;
  bottomSashHeight:number = -1;
  unitChoice:string = "";
  panelLayout:SVGTemplate[][];
  panelLayoutDims:number[] = [0, 0];
  topPanelLayoutDims:number[] = [0, 0];
  topPanelWidth:number = 0;
  topPanelHeight:number = 0;
  bottomPanelWidth:number = 0;
  bottomPanelHeight:number = 0;
  numberTopPanels:number = 0;
  bottomPanelLayoutDims:number[] = [0, 0];
  currentPanelID:number;
  topSash:boolean = true;
  finishedSashes:boolean = false;
  userInfo:any;
  selectedTemplateID:number = -1;
  selectedTemplateIDs:number[] = []; // For tdi multi-click
  signedIn:boolean = false;
  selectedTemplateCategory:string;
  selectedPalleteCategory:string;
  selectedPalleteID:number = -1;
  selectedPalleteColors:string[] = [];
  palletes:{id:number, category:string, colorPlacements:string}[] = [];
  chosenPanel:{id:number, name:string, panelNumber:number, d:string, panelAutofillString:string};
  templatesAvailable:boolean = false;
  shoppingCart:any[] = [];

  stage2Visible:boolean = true;
  stage3Visible:boolean = false;
  templateSectionVisible:boolean = false;
  shoppingSectionActive:boolean = false;
  oldDesignProcessActive:boolean = false;
  cartItems:number = 0;

  currentStepID:number = -1;

  windowWidthFractionNum:number;
  windowHeightFractionNum:number;
  bottomSashWidthFractionNum:number;
  bottomSashHeightFractionNum:number;
  dividerWidthFractionNum:number;

  continueSavedOrder:boolean = false;
  sampleOrder:string = "";
  sessionID:number;
  sessionStartingUrl:string = "/;";

  // Array holding all window shapes offered
  windowShapes:string[] = [
  'vertical2to6', 'vertical2to4', 'vertical1to6', 'vertical1to4', 'vertical1to2',
  'horizontal6to2', 'horizontal6to1',  'horizontal4to2', 'horizontal4to1', 'horizontal2to1', 
  '2xhung1to2', '2xhung2to2', '2xhung1to4', '2xhung2to4', '2xhung4to4',
  'square1to1', 'square2to2', 'square4to4'
  ];

  getOptimalWidthHeight(widths:number[], heights:number[]) {
    // Getting optimal widths and heights by checking every combination for top panels
    let bestCombo:number[] = [0, 0];
    let widthHeightRatio = widths[0] / heights[0];
    let acceptableCombos:number[][] = [];
    for(let widthIndex:number = 0; widthIndex < widths.length; ++widthIndex) {
        for(let heightIndex:number = 0; heightIndex < heights.length; ++heightIndex) {
            if(Math.abs(1 - widths[widthIndex] / heights[heightIndex]) <= Math.abs(1 - widthHeightRatio)) {
                // Met the requirements within a 6x6 template of ratio .75-1.33
                if((widths[widthIndex] / heights[heightIndex]) <= 1.33 && (widths[widthIndex] / heights[heightIndex]) >= .75) {
                    acceptableCombos.push([widthIndex, heightIndex]);
                }
                bestCombo = [widthIndex, heightIndex];
                widthHeightRatio = widths[widthIndex] / heights[heightIndex];
            }
        }
    }
    let width = acceptableCombos.length > 0 ? widths[acceptableCombos[0][0]] : widths[bestCombo[0]];
    let height = acceptableCombos.length > 0 ? heights[acceptableCombos[0][1]] : heights[bestCombo[1]];
    
    return [width, height];
  }


  getPanelInfoOld(temp:{id:number, numPanels:number, panelDims:number[], tempString:string, category:string}):void {
    let verticalDividers:number = this.dividerNumbers[1];
    let horizontalDividers:number = this.dividerNumbers[0];
    // Not a double hung
    if(this.bottomSashWidth <= 0 && this.bottomSashHeight <= 0) {
        if(this.selectedDividerType == "nodiv") {
            this.topPanelWidth = this.windowWidth / (Math.ceil(this.windowWidth/386));
            this.topPanelHeight = this.windowHeight / (Math.ceil(this.windowHeight/386));
        }
        else if(this.selectedDividerType == "embeddeddiv") {
            this.topPanelWidth = this.windowWidth / (verticalDividers+1);
            this.topPanelHeight = this.windowHeight / (horizontalDividers+1);
        }
        else if(this.selectedDividerType == "raiseddiv") {
             this.topPanelWidth = ((this.windowWidth - (verticalDividers*this.dividerWidth)) / (verticalDividers+1));
             this.topPanelHeight = ((this.windowHeight - (horizontalDividers*this.dividerWidth)) / (horizontalDividers+1));
         }

         this.numberTopPanels = temp.tempString.split(";").length;
         // this.topPanelWidth = topPanelWidths[bestCombo[0]];
         // this.topPanelHeight = topPanelHeights[bestCombo[1]];
         // this.numberTopPanels = temp.tempString.split(";").length;
        
    }
    else {
        if(this.selectedDividerType == "nodiv") {
            this.topPanelWidth = this.windowWidth / (Math.ceil(this.windowWidth/386));
            this.topPanelHeight = this.windowHeight / (Math.ceil(this.windowHeight/386));
            this.bottomPanelWidth = this.bottomSashWidth / (Math.ceil(this.bottomSashWidth/386));
            this.bottomPanelHeight = this.bottomSashHeight / (Math.ceil(this.bottomSashHeight/386));
        }
        else if(this.selectedDividerType == "embeddeddiv" || this.selectedDividerType == "'embeddeddiv'") {
            this.topPanelWidth = this.windowWidth / (verticalDividers+1);
            this.topPanelHeight = this.windowHeight / (horizontalDividers+1);
            this.bottomPanelWidth = this.bottomSashWidth / (verticalDividers+1);
            this.bottomPanelHeight = this.bottomSashHeight / (horizontalDividers+1);
        }
        else if(this.selectedDividerType == "raiseddiv") {
            this.topPanelWidth = ((this.windowWidth - (verticalDividers*this.dividerWidth)) / (verticalDividers+1));
            this.topPanelHeight = ((this.windowHeight - (horizontalDividers*this.dividerWidth)) / (horizontalDividers+1));
             this.bottomPanelWidth = ((this.bottomSashWidth - (verticalDividers*this.dividerWidth)) / (verticalDividers+1));
             this.bottomPanelHeight = ((this.bottomSashHeight - (horizontalDividers*this.dividerWidth)) / (horizontalDividers+1));
         }
         let numberPanelsX:number = Math.floor(this.windowWidth / this.topPanelWidth);
          let numberPanelsY:number = Math.floor(this.windowHeight / this.topPanelHeight);
          this.numberTopPanels = numberPanelsX * numberPanelsY;
     }
  }

  getPanelInfo(temp:{id:number, numPanels:number, panelDims:number[], tempString:string, category:string}):void {
    let verticalDividers:number = this.dividerNumbers[1];
    let horizontalDividers:number = this.dividerNumbers[0];
    // Not a double hung
    //alert(this.bottomSashWidth + ", " + this.bottomSashHeight);
    if(this.bottomSashWidth <= 0 && this.bottomSashHeight <= 0) {
        if(this.selectedDividerType == "nodiv") {
            this.topPanelWidth = this.windowWidth;
            this.topPanelHeight = this.windowHeight;
        }
        else if(this.selectedDividerType == "embeddeddiv") {
            this.topPanelWidth = this.windowWidth / (verticalDividers+1);
            this.topPanelHeight = this.windowHeight / (horizontalDividers+1);
        }
        else if(this.selectedDividerType == "raiseddiv") {
            this.topPanelWidth = ((this.windowWidth - (verticalDividers*this.dividerWidth)) / (verticalDividers+1));
            this.topPanelHeight = ((this.windowHeight - (horizontalDividers*this.dividerWidth)) / (horizontalDividers+1));
        }
        this.numberTopPanels = temp.tempString.split(";").length;
        // this.topPanelWidth = topPanelWidths[bestCombo[0]];
        // this.topPanelHeight = topPanelHeights[bestCombo[1]];
        // this.numberTopPanels = temp.tempString.split(";").length;
        
    }
    else {
        if(this.selectedDividerType == "nodiv") {
            this.topPanelWidth = this.windowWidth;
            this.topPanelHeight = this.windowHeight;
            this.bottomPanelWidth = this.bottomSashWidth;
            this.bottomPanelHeight = this.bottomSashHeight;
        }
        else if(this.selectedDividerType == "embeddeddiv" || this.selectedDividerType == "'embeddeddiv'") {
            this.topPanelWidth = this.windowWidth / (verticalDividers+1);
            this.topPanelHeight = this.windowHeight / (horizontalDividers+1);
            this.bottomPanelWidth = this.bottomSashWidth / (verticalDividers+1);
            this.bottomPanelHeight = this.bottomSashHeight / (horizontalDividers+1);
        }
        else if(this.selectedDividerType == "raiseddiv") {
            this.topPanelWidth = ((this.windowWidth - (verticalDividers*this.dividerWidth)) / (verticalDividers+1));
            this.topPanelHeight = ((this.windowHeight - (horizontalDividers*this.dividerWidth)) / (horizontalDividers+1));
            this.bottomPanelWidth = ((this.bottomSashWidth - (verticalDividers*this.dividerWidth)) / (verticalDividers+1));
            this.bottomPanelHeight = ((this.bottomSashHeight - (horizontalDividers*this.dividerWidth)) / (horizontalDividers+1));
        }
        let numberPanelsX:number = Math.floor(this.windowWidth / this.topPanelWidth);
         let numberPanelsY:number = Math.floor(this.windowHeight / this.topPanelHeight);
         this.numberTopPanels = numberPanelsX * numberPanelsY;
    }


    // Getting all possible widths for top
    let topPanelWidths:number[] = [];
    let reductionFactor:number = 1;
    while(this.topPanelWidth / reductionFactor >= 100) {
        if(this.topPanelWidth/reductionFactor >= 100 && this.topPanelWidth/reductionFactor <= 386) {
          if((this.windowWidth-(this.dividerWidth*this.dividerNumbers[1]))/(this.topPanelWidth/reductionFactor) <= (this.isDoubleHung() ? 3 : 6)) {
            topPanelWidths.push(this.topPanelWidth/reductionFactor);
          }
        }
        ++reductionFactor;
    }

    // Getting all possible heights for top
    let topPanelHeights:number[] = [];
    reductionFactor = 1;
    while(this.topPanelHeight / reductionFactor >= 100) {
        if(this.topPanelHeight/reductionFactor >= 100 && this.topPanelHeight/reductionFactor <= 386) {
          if((this.windowHeight-(this.dividerWidth*this.dividerNumbers[0]))/(this.topPanelHeight/reductionFactor) <= (this.isDoubleHung() ? 3 : 6)) {
            topPanelHeights.push(this.topPanelHeight/reductionFactor);
          }
        }
        ++reductionFactor;
    }

    // Getting the best top width and height
    [this.topPanelWidth, this.topPanelHeight] = this.getOptimalWidthHeight(topPanelWidths, topPanelHeights);
    
    if(!(this.bottomSashWidth <= 0 && this.bottomSashHeight <= 0)) {
        // Getting all possible widths for bottom
        let bottomPanelWidths:number[] = [];
        reductionFactor = 1;
        while(this.bottomPanelWidth / reductionFactor >= 100) {
            if(this.bottomPanelWidth/reductionFactor >= 100 && this.bottomPanelWidth/reductionFactor <= 386) {
              if((this.bottomSashWidth-(this.dividerWidth*this.dividerNumbers[1]))/(this.bottomPanelWidth/reductionFactor) <= (this.isDoubleHung() ? 3 : 6)) {
                bottomPanelWidths.push(this.bottomPanelWidth/reductionFactor);
              }
            }
            ++reductionFactor;
        }
        

        // Getting all possible heights for bottom
        let bottomPanelHeights:number[] = [];
        reductionFactor = 1;
        while(this.bottomPanelHeight / reductionFactor >= 100) {
            if(this.bottomPanelHeight/reductionFactor >= 100 && this.bottomPanelHeight/reductionFactor <= 386) {
              if((this.bottomSashHeight-(this.dividerWidth*this.dividerNumbers[0]))/(this.bottomPanelHeight/reductionFactor) <= (this.isDoubleHung() ? 3 : 6)) {
                bottomPanelHeights.push(this.bottomPanelHeight/reductionFactor);
              }
            }
            ++reductionFactor;
        }

        [this.bottomPanelWidth, this.bottomPanelHeight] = this.getOptimalWidthHeight(bottomPanelWidths, bottomPanelHeights);
    }
    let numberPanelsX:number = Math.floor((this.windowWidth) / this.topPanelWidth);
    let numberPanelsY:number = Math.floor((this.windowHeight) / this.topPanelHeight);
    let numberBottomPanelsX:number = 0;
    let numberBottomPanelsY:number = 0;
    if(!(this.bottomSashWidth <= 0 && this.bottomSashHeight <= 0)) {
        numberBottomPanelsX = Math.floor((this.bottomSashWidth) / this.bottomPanelWidth);
        numberBottomPanelsY = Math.floor((this.bottomSashHeight) / this.bottomPanelHeight);
        this.numberTopPanels = numberPanelsX * numberPanelsY;
    }
    if(this.numberTopPanels + (numberBottomPanelsX*numberBottomPanelsY) != temp.tempString.split(";").length) {this.getPanelInfoOld(temp);}
}

  // Gets the number of top panels for the window
  getNumberTopPanels(temp:{id:number, numPanels:number, panelDims:number[], tempString:string, category:string}):number {
    // Not a double hung
    let topPanelWidth:number = 0;
    let topPanelHeight:number = 0;
    let bottomPanelWidth:number = 0;
    let bottomPanelHeight:number = 0;
    if(this.bottomSashWidth <= 0 && this.bottomSashHeight <= 0) {
        if(this.selectedDividerType == "nodiv") {
            topPanelWidth = this.windowWidth / (Math.ceil(this.windowWidth/386));
            topPanelHeight = this.windowHeight / (Math.ceil(this.windowHeight/386));
        }
        else if(this.selectedDividerType == "embeddeddiv") {
            topPanelWidth = this.windowWidth / (this.dividerNumbers[0]+1);
            topPanelHeight = this.windowHeight / (this.dividerNumbers[1]+1);
        }
        else if(this.selectedDividerType == "raiseddiv") {
            topPanelWidth = ((this.windowWidth - (this.dividerNumbers[0]*this.dividerWidth)) / (this.dividerNumbers[0]+1));
            topPanelHeight = ((this.windowHeight - (this.dividerNumbers[1]*this.dividerWidth)) / (this.dividerNumbers[1]+1));
        }
        this.numberTopPanels = temp.tempString.split(";").length;
    }
    else {
        if(this.selectedDividerType == "nodiv") {
            topPanelWidth = this.windowWidth / (Math.ceil(this.windowWidth/386));
            topPanelHeight = this.windowHeight / (Math.ceil(this.windowHeight/386));
            bottomPanelWidth = this.bottomSashWidth / (Math.ceil(this.bottomSashWidth/386));
            bottomPanelHeight = this.bottomSashHeight / (Math.ceil(this.bottomSashHeight/386));
        }
        else if(this.selectedDividerType == "embeddeddiv" || this.selectedDividerType == "'embeddeddiv'") {
            topPanelWidth = this.windowWidth / (this.dividerNumbers[0]+1);
            topPanelHeight = this.windowHeight / (this.dividerNumbers[1]+1);
            bottomPanelWidth = this.bottomSashWidth / (this.dividerNumbers[0]+1);
            bottomPanelHeight = this.bottomSashHeight / (this.dividerNumbers[1]+1);
        }
        else if(this.selectedDividerType == "raiseddiv") {
            topPanelWidth = ((this.windowWidth - (this.dividerNumbers[0]*this.dividerWidth)) / (this.dividerNumbers[0]+1));
            topPanelHeight = ((this.windowHeight - (this.dividerNumbers[1]*this.dividerWidth)) / (this.dividerNumbers[1]+1));
            bottomPanelWidth = ((this.bottomSashWidth - (this.dividerNumbers[0]*this.dividerWidth)) / (this.dividerNumbers[0]+1));
            bottomPanelHeight = ((this.bottomSashHeight - (this.dividerNumbers[1]*this.dividerWidth)) / (this.dividerNumbers[1]+1));
        }
        let numberPanelsX:number = Math.floor(this.windowWidth / topPanelWidth);
        let numberPanelsY:number = Math.floor(this.windowHeight / topPanelHeight);
        this.numberTopPanels = numberPanelsX * numberPanelsY;
        
    }
    return this.numberTopPanels;
    
}

colorsData:{id:number, name:string, hex:string, darkHex:string, paneColor:boolean, isAvailable:boolean, placementID:number, opacity:number, darkOpacity:number}[] = [];

  // Array holding all colors currently offered with corresponding hex values
  oldColorsData:{id:number, name:string, hex:string, paneColor:boolean, isAvailable:boolean}[] = [
    {id:0, name:"Black", hex:"141315", paneColor:true, isAvailable:true},
    {id:1, name:"Gray", hex:"d6d2ce", paneColor:true, isAvailable:true},
    {id:2, name:"Frosted Clear", hex:"e8e7ea", paneColor:true, isAvailable:true},
    {id:3, name:"White", hex:"f0f0f1", paneColor:true, isAvailable:true},
    {id:4, name:"Red", hex:"ff0000", paneColor:true, isAvailable:true},
    {id:5, name:"Frosted Red", hex:"bb2118", paneColor:true, isAvailable:true},
    {id:6, name:"Pink", hex:"eb5b78", paneColor:true, isAvailable:true},
    {id:7, name:"Frosted Pink", hex:"b98ea8", paneColor:true, isAvailable:true},
    {id:8, name:"Orange", hex:"e14931", paneColor:true, isAvailable:true},
    {id:9, name:"Goldenrod", hex:"f7af33", paneColor:true, isAvailable:true},

    {id:10, name:"Frosted Orange", hex:"e45323", paneColor:true, isAvailable:true},
    {id:11, name:"Frosted Gold", hex:"dba22d", paneColor:true, isAvailable:true},
    {id:12, name:"Yellow", hex:"f2cc2e", paneColor:true, isAvailable:true},
    {id:13, name:"Frosted Yellow", hex:"c7c26b", paneColor:true, isAvailable:true},
    {id:14, name:"Green", hex:"054c20", paneColor:true, isAvailable:true},
    {id:15, name:"Aqua", hex:"0f7285", paneColor:true, isAvailable:true},
    {id:16, name:"Frosted Aqua", hex:"66bebd", paneColor:true, isAvailable:true},
    {id:17, name:"Blue", hex:"178fdc", paneColor:true, isAvailable:true},
    {id:18, name:"Light Blue", hex:"5fbefd", paneColor:true, isAvailable:true},
    {id:19, name:"Frosted Blue", hex:"89aecc", paneColor:true, isAvailable:true},

    {id:20, name:"Frosted Ice Blue", hex:"b0c0c7", paneColor:true, isAvailable:true},
    {id:21, name:"Purple", hex:"75459a", paneColor:true, isAvailable:true},
    {id:22, name:"Frosted Lavendar", hex:"bd96b8", paneColor:true, isAvailable:true},
    {id:23, name:"Brown", hex:"2c1406", paneColor:true, isAvailable:true},
    {id:24, name:"Ivory", hex:"dec89f", paneColor:true, isAvailable:true}
  ];

  tdiColorsData:{id:number, name:string, hex:string, darkHex:string, paneColor:boolean, isAvailable:boolean, placementID:number, opacity:number, darkOpacity:number}[] = [
    {id:0, name:"Red", hex:"ff0000", darkHex:"ffffff", paneColor:true, isAvailable:true, placementID:0, opacity:1, darkOpacity:1},
    {id:1, name:"Orange", hex:"e14931", darkHex:"ffffff", paneColor:true, isAvailable:true, placementID:1, opacity:1, darkOpacity:1},
    {id:2, name:"Yellow", hex:"f2cc2e", darkHex:"ffffff", paneColor:true, isAvailable:true, placementID:2, opacity:1, darkOpacity:1},
    {id:3, name:"Green", hex:"054c20", darkHex:"ffffff", paneColor:true, isAvailable:true, placementID:3, opacity:1, darkOpacity:1},
    {id:4, name:"Blue", hex:"178fdc", darkHex:"ffffff", paneColor:true, isAvailable:true, placementID:4, opacity:1, darkOpacity:1},
    {id:5, name:"Purple", hex:"75459a", darkHex:"ffffff", paneColor:true, isAvailable:true, placementID:5, opacity:1, darkOpacity:1},
    {id:6, name:"White", hex:"f0f0f1", darkHex:"ffffff", paneColor:true, isAvailable:true, placementID:6, opacity:1, darkOpacity:1}

  ];

  // Array holding all colors currently offered with corresponding hex values
  filamentColorsData:{id:number, name:string, hex:string, paneColor:boolean}[] = [
    {id:0, name:"silver", hex:"666666", paneColor:false},
    {id:1, name:"gold", hex:"FFD700", paneColor:false},
    {id:2, name:"bronze", hex:"CD7F32", paneColor:false},
    {id:3, name:"black", hex:"000000ff", paneColor:false}
  ];

  resetFractionNums():void {
    this.windowWidthFractionNum = 0;
    this.windowHeightFractionNum = 0;
    this.bottomSashWidthFractionNum = 0;
    this.bottomSashHeightFractionNum = 0;
    this.dividerWidthFractionNum = 0;
  }

  // Method to filter templates based on selected categories
  filterTemplates():void {
    this.filteredTemplateData = [];
    for(let i:number = 0; i < this.templateData.length; ++i) {
      // Pushing templates if they fit and are valid
      if(this.templateData[i].panelDims[0] == this.panelLayoutDims[0] && this.templateData[i].panelDims[1] == this.panelLayoutDims[1]) {
        if(this.isTemplateOkay(this.templateData[i])) {
          this.filteredTemplateData.push(this.templateData[i]);
          // alert("foubdn one");
        }
      }
    }
    // console.log(this.filteredTemplateData);
  }

  // Checking whether it is the color page (TDI)
  isColorPage():boolean {
    return document.URL.includes("windowCreation");
  }

  getPanelWidth(top:boolean = true):number {
    let width:number = top ? this.windowWidth : this.bottomSashWidth;
    if(width <= 0) {return -1;}
    let vertDividers:number = this.dividerNumbers[1];
    let finalPanelWidth:number = 0; 
    if(this.selectedDividerType == 'nodiv') {
      if(width >= 100 && width <=500) {finalPanelWidth = width;}
      else {finalPanelWidth = width / (Math.ceil(width/500));}
    }
    else if(this.selectedDividerType == 'embeddeddiv') {
      finalPanelWidth = width / (vertDividers+1);
      
    }
    // raised divs
    else {
      finalPanelWidth = ((width - (vertDividers*this.dividerWidth)) / (vertDividers+1));
    }
    // Fixing panel width to be under 500
    if(finalPanelWidth > 500) {finalPanelWidth = finalPanelWidth / (Math.ceil(finalPanelWidth/500));}
    if(finalPanelWidth >= 100 && finalPanelWidth <= 500) {return finalPanelWidth;}
    else {return -1;}
  }

  getPanelHeight(top:boolean = true):number {
    let height:number = top ? this.windowHeight : this.bottomSashHeight;
    if(height <= 0) {return -1;}
    let horzDividers:number = this.dividerNumbers[0];
    let finalPanelHeight:number = 0; 
    if(this.selectedDividerType == 'nodiv') {
      if(height >= 100 && height <=500) {finalPanelHeight = height;}
      else {finalPanelHeight = height / (Math.ceil(height/500));}
    }
    else if(this.selectedDividerType == 'embeddeddiv') {
      finalPanelHeight = height / (horzDividers+1);
    }
    // raised divs
    else {
      finalPanelHeight = ((height - (horzDividers*this.dividerWidth)) / (horzDividers+1));
    }
    // Fixing panel height to be under 500
    if(finalPanelHeight >= 500) {finalPanelHeight = finalPanelHeight / (Math.ceil(finalPanelHeight/500));}
    
    if(finalPanelHeight >= 100 && finalPanelHeight <= 500) {return finalPanelHeight;}
    else {return -1;}
  }

  isRowInTopSash(rowNum:number):boolean {
    let numberTopRows:number = Math.floor(this.windowHeight / this.getPanelHeight());
    if(rowNum < numberTopRows) {return true;}
    else {return false;} 
  }

  // Method verifying template is okay
  isTemplateOkay(temp:{id:number, numPanels:number, panelDims:number[], tempString:string, category:string}):boolean {
    let isOkay:boolean = true;
    if(!this.isColorPage()) {
      if(temp.category != undefined) {
        
        let categories:string[] = this.selectedTemplateCategory.split(";");
        isOkay = false;
        for(let i:number = 0; i < categories.length; ++i) {
          if(temp.category.includes(categories[i]) && categories[i] != '') {isOkay = true;}
        }
      }
      else {isOkay = false; return false;}
    }
    else {
      if((temp.category == undefined || temp.category == "") && (this.selectedTemplateCategory == undefined || this.selectedTemplateCategory == "unassigned")) {isOkay = true;}
      else if(temp.category != undefined && (this.selectedTemplateCategory != undefined) ) {
        let categories:string[] = this.selectedTemplateCategory.split(";");
        isOkay = false;
        for(let i:number = 0; i < categories.length; ++i) {
          if(temp.category.includes(categories[i]) && categories[i] != '') {isOkay = true;}
        }
      }
      else {isOkay = false; return false;}
    }
    if(temp.tempString == "-1") {return false;}
    // Splitting the tempString info into a 2d array of panel info
    let tempString:string[] = temp.tempString.split(';');
    let panelInfoArray:string[][] = [];
    for(let index:number = 0; index < tempString.length; ++index) {
      panelInfoArray.push(tempString[index].split(','));
    }

    let rowNumber:number = -1;
    // Adding each panel to the panel layout
    for(let panelID:number = 0; panelID < panelInfoArray.length; ++panelID) {
      if(panelID % temp.panelDims[0] == 0) {++rowNumber;}

      // Check for templates with -1 panelset selected
      if(Number(panelInfoArray[panelID][0]) == -1) {return false;}
      
      let panelIndex:number = this.svgTemplateData[Number(panelInfoArray[panelID][0])].findIndex(function(item, i){
        return Number(item.panelNumber) == Number(panelInfoArray[panelID][1]);
      });
      // console.log(panelIndex);
      
      if(this.svgTemplateData[Number(panelInfoArray[panelID][0])][panelIndex] == undefined) {isOkay = false; break;}
      let myTemplate:SVGTemplate = new SVGTemplate(this.svgTemplateData[Number(panelInfoArray[panelID][0])][panelIndex].d);
      myTemplate.numberRotations = Number(panelInfoArray[panelID][2]);
      myTemplate.flipped = Number(panelInfoArray[panelID][3]) == 1 ? true : false;
      if(myTemplate.getScaledD( ( this.isRowInTopSash(rowNumber) ? this.getPanelWidth() : this.getPanelWidth(false) )/300 , ( this.isRowInTopSash(rowNumber) ? this.getPanelHeight() : this.getPanelHeight(false) )/300 )[0].includes("NaN")) {isOkay = false; break;}
      
      //panelLayout[Math.floor(panelID/temp.panelDims[0])].push(myTemplate);
    }
    if(isOkay) {this.templatesAvailable = true;}
    return isOkay;
  }

  // Array that holds each panel's color makeup
  panelColoringArray:string[][] = [];
  darkPanelColoringArray:string[][] = [];
  templateData:{id:number, numPanels:number, panelDims:number[], tempString:string, category:string}[];
  filteredTemplateData:{id:number, numPanels:number, panelDims:number[], tempString:string, category:string}[];
  // Array containing the svgPath data for displaying icons / generating a template
  svgTemplateData:{id:number, name:string, panelNumber:number, d:string, panelAutofillString:string}[][];
  //   // FLW02
  //   [
  //     {id:5, name:"1_7Aframe05_development.svg", d:"M -51.923624,-11.58576 V 288.41428 H 248.07641 V -11.58576 Z m 5.00007,5.0000754 H 8.0761657 V 48.414036 H -46.923554 Z m 60.99969,0 H 182.07664 V 48.414036 H 14.076136 Z m 174.000484,0 h 54.99971 V 48.414036 H 188.07662 Z M -46.923554,54.414026 H 8.0761657 V 222.41398 H -46.923554 Z m 61.00025,0 H 182.07664 v 69.999924 l -84.000254,45.00011 -83.99969,-45.00011 z m 173.999924,0 h 54.99971 V 222.41398 h -54.99971 z m -174.000484,77.761594 80.99889,43.34369 h 5.6e-4 v 0 107.89433 h -80.99943 v -107.89433 0 -43.34369 z m 167.999954,0 v 43.34369 0 107.89433 h -80.99943 v -107.89433 0 h 10e-4 l 80.99833,-43.34369 z M -46.923554,228.41394 H 8.0761657 V 283.4142 H -46.923554 Z m 235.000174,0 h 54.99971 v 55.00026 h -54.99971 z"},
  //     {id:4, name:"1_7Aframe04_development.svg", d:"M -44.166681,-1.0424105 V 298.95762 H 255.83335 V -1.0424105 Z M 21.833635,3.8518311 H 189.83358 V 73.851749 L 105.83333,118.85186 21.833635,73.851749 Z M -39.166607,3.9576644 H 15.833105 V 232.95783 h -54.999712 z m 235.000167,0 h 54.99971 V 232.95783 H 195.83356 Z M 21.833082,81.613961 102.8011,124.94061 h 0.0314 v 0.0166 0 168.99986 H 21.833082 v -168.99981 -0.0172 -43.326643 z m 167.999948,0 v 43.326649 0.0172 168.99987 H 108.8336 v -168.99987 -0.0172 h 0.032 z M -39.166607,238.95782 h 54.999712 v 54.99973 h -54.999712 z m 235.000167,0 h 54.99971 v 54.99973 h -54.99971 z"},
  //     {id:3, name:"1_7Aframe03_development.svg", d:"M -27.404534,-9.2129436 V 290.78709 H 272.5955 V -9.2129436 Z m 66.00032,4.894241 H 206.59573 V 65.681215 L 122.59548,110.68132 38.595786,65.681215 Z m -61.00025,0.105834 h 54.99972 V 285.78702 h -54.99972 z m 235.000174,0 h 54.99971 V 285.78702 H 212.59571 Z M 38.595226,73.443427 119.56325,116.77004 h 0.0314 v 0.0166 0 168.99987 H 38.595226 v -168.99987 -0.0172 -43.326617 z m 167.999954,0 v 43.326613 0.0172 168.99987 h -80.99943 v -168.99986 -0.0172 h 0.032 z"},
  //     {id:2, name:"1_7Aframe02_development.svg", d:"M -43.375742,-4.9970979 V 295.00293 H 256.62429 V -4.9970979 Z m 5.000074,5.00007467 H 16.624044 V 290.00285 h -54.999712 z m 60.999689,0 H 103.62401 V 290.00285 H 22.624021 Z m 87.000519,0 h 80.99943 V 290.00285 h -80.99943 z m 86.99941,0 h 54.9997 V 290.00285 h -54.9997 z"},
  //     {id:1, name:"1_7Aframe01_development.svg", d:"M -49.550816,1.8618516 V 301.85856 H 250.44921 V 1.8618516 Z m 5.00007,5.00007 h 54.99972 V 235.86102 h -54.99972 z m 60.999693,0 H 97.448931 V 190.86201 l -80.999984,42.99975 v -42.99975 z m 87.000513,0 h 80.99999 V 190.86201 233.86176 l -80.99999,-42.99975 z m 86.99996,0 h 54.99971 V 235.86102 H 190.44942 Z M 100.4492,196.86144 l 84.00025,44.99954 v 55.00028 H 16.4495 v -55.00028 z m -144.999946,44.99901 h 54.99972 v 55.00081 h -54.99972 z m 235.000166,0.003 h 54.99971 v 54.99973 h -54.99971 z"}
  //   ],

  //   // FLW03
  //   [
  //     {id:5, name:"1_8Aframe04_development.svg", d:"M -44.166681,0.53946792 V 300.5395 H 255.83335 V 0.53946792 Z m 5.000074,5.00007398 H 250.83327 V 51.539559 H -39.166607 Z m 0,51.9999971 H 50.83307 V 295.53943 h -89.999677 z m 96.000207,0 h 97.99946 V 147.53922 H 56.8336 Z m 103.99999,0 h 89.99968 V 295.53943 H 160.83359 Z M 56.8336,153.5392 h 97.99946 V 295.53943 H 56.8336 Z"},
  //     {id:4, name:"1_8Aframe03_development.svg", d:"M -44.166681,2.9122837 V 302.91231 H 255.83335 V 2.9122837 Z m 5.000074,5.000074 H 102.83307 V 75.912482 H -39.166607 Z m 148.000207,0 H 250.83327 V 75.912482 H 108.8336 Z M -39.166607,81.912461 H 2.8332432 V 149.91203 H -39.166607 Z m 47.9998271,0 H 50.83307 V 149.91203 H 8.8332201 Z m 48.0003799,0 h 45.99947 V 149.91203 H 56.8336 Z m 51.99945,0 h 46.00001 v 67.999569 h -46.00001 z m 52.00054,0 h 41.99985 v 67.999569 h -41.99985 z m 47.99983,0 h 41.99985 V 149.91203 H 208.83342 Z M -39.166607,155.91256 H 50.83307 v 141.99968 h -89.999677 z m 96.000207,0 h 45.99947 v 75.99991 H 56.8336 Z m 51.99945,0 h 46.00001 v 75.99991 h -46.00001 z m 52.00054,0 h 89.99968 V 297.91224 H 160.83359 Z M 56.8336,237.91245 h 45.99947 v 59.99979 H 56.8336 Z m 51.99945,0 h 46.00001 v 59.99979 h -46.00001 z"},
  //     {id:3, name:"1_8Aframe02_development.svg", d:"M -44.166681,-0.25147069 V 299.74856 H 255.83335 V -0.25147069 Z m 5.000074,5.00007399 H 50.83307 V 294.74849 h -89.999677 z m 96.000207,0 h 45.99947 V 294.74849 H 56.8336 Z m 51.99945,0 h 46.00001 V 294.74849 h -46.00001 z m 52.00054,0 h 89.99968 V 294.74849 h -89.99968 z"},
  //     {id:2, name:"1_8Aframe02_development.svg", d:"M -44.166681,-0.25147069 V 299.74856 H 255.83335 V -0.25147069 Z m 5.000074,5.00007399 H 50.83307 V 294.74849 h -89.999677 z m 96.000207,0 h 45.99947 V 294.74849 H 56.8336 Z m 51.99945,0 h 46.00001 V 294.74849 h -46.00001 z m 52.00054,0 h 89.99968 V 294.74849 h -89.99968 z"},
  //     {id:1, name:"1_8Aframe01_development.svg", d:"M -44.166681,2.1213451 V 302.12137 H 255.83335 V 2.1213451 Z M 56.97416,7.2625302 h 45.71835 V 135.98012 H 56.97416 Z m 52,0 H 154.6925 V 135.98012 H 108.97416 Z M -38.969272,7.3187542 H 50.635734 V 135.92389 h -89.605006 z m 200.000202,0 h 89.60501 V 135.92389 H 161.03093 Z M -38.965965,142.3224 H 102.63243 v 66.59838 H -38.965965 Z m 148.000205,0 h 141.5984 v 66.59838 H 109.03424 Z M -38.962657,215.32536 H 250.62931 v 81.59197 H -38.962657 Z"}
  //   ],

  //   // FLW04a
  //   [
  //     {id:4, name:"1_9AL_frame04plain.svg", d:"M -44.166681,2.9122837 V 302.91231 H 255.83335 V 2.9122837 Z m 5.000074,5.000074 H 17.833465 V 56.91209 h -57.000072 z m 63.000049,0 H 79.833057 V 56.91209 H 23.833442 Z m 63.00005,0 H 194.8331 V 56.91209 H 86.833492 Z m 113.999588,0 h 50.00019 V 56.91209 H 200.83308 Z M -39.166607,62.91207 h 57.000072 v 49.00028 h -57.000072 z m 63.000049,0 H 194.8331 v 49.00028 H 161.51214 A 36,36 0 0 0 128.83334,90.912153 36,36 0 0 0 96.14903,111.91235 H 23.833442 Z m 176.999638,0 h 50.00019 v 49.00028 h -50.00019 z m -71.99974,34.00006 a 30,30 0 0 1 29.99989,29.99989 30,30 0 0 1 -29.99989,30.00044 30,30 0 0 1 -29.999891,-30.00044 30,30 0 0 1 29.999891,-29.99989 z m -167.999947,21.0002 h 57.000072 v 179.99991 h -57.000072 z m 63.000049,0 h 70.189552 a 36,36 0 0 0 -1.189525,8.99969 36,36 0 0 0 32.999611,35.84994 v 27.2824 A 63.000003,63.000003 0 0 0 83.833227,173.9125 63.000003,63.000003 0 0 0 23.833442,217.78427 Z m 139.829538,0 h 31.17012 v 68.00012 h -63.00005 v -23.14553 a 36,36 0 0 0 33.00016,-35.8549 36,36 0 0 0 -1.17023,-8.99969 z m 37.1701,0 h 50.00019 v 68.00012 H 200.83308 Z M 83.833227,179.91247 A 57.000003,57.000003 0 0 1 140.8333,236.91255 57.000003,57.000003 0 0 1 83.833227,293.91208 57.000003,57.000003 0 0 1 26.833156,236.91255 57.000003,57.000003 0 0 1 83.833227,179.91247 Z m 47.999823,11.99996 h 63.00005 v 49.99964 h -48.25007 a 63.000003,63.000003 0 0 0 0.25025,-4.99952 63.000003,63.000003 0 0 0 -15.00023,-40.69844 z m 69.00003,0 h 50.00019 v 49.99964 h -50.00019 z m -55.02617,55.99962 h 49.02619 v 50.00019 H 99.367024 a 63.000003,63.000003 0 0 0 46.439886,-50.00019 z m 55.02617,0 h 50.00019 v 50.00019 h -50.00019 z m -176.999638,7.97222 a 63.000003,63.000003 0 0 0 44.569065,42.02797 H 23.833442 Z"},
  //     {id:3, name:"1_9AL_frame03_development.svg", d:"M -54.296444,-1.3035568 V 298.69647 H 245.70359 V -1.3035568 Z m 5.00007,5.00007 H 7.703706 V 52.696253 h -57.00008 z m 63.00005,0 H 69.703294 V 52.696253 H 13.703676 Z m 62.000149,0 H 115.70331 V 293.6964 H 75.703825 Z m 45.999465,0 H 240.70351 V 107.69651 H 121.70329 Z M -49.296374,58.696233 h 57.00008 v 49.000277 h -57.00008 z m 63.00005,0 H 69.703294 V 107.69651 H 13.703676 Z m -63.00005,55.000257 H 69.703294 V 293.6964 H -49.296374 Z m 170.999664,0 H 240.70351 V 293.6964 H 121.70329 Z"},
  //     {id:2, name:"1_9AL_frame02_development.svg", d:"M -49.550812,-11.585759 V 288.41427 H 250.44921 V -11.585759 Z m 5.000074,5.0000738 H 74.448926 V 283.4142 H -44.550738 Z m 125.000195,0 H 120.44894 V 283.4142 H 80.449457 Z m 45.999463,0 H 245.44914 V 283.4142 H 126.44892 Z"},
  //     {id:1, name:"1_9AL_frame01_development.svg", d:"M -44.166681,-0.25147069 V 299.74856 H 255.83335 V -0.25147069 Z m 5.000074,5.00007399 H 79.833057 V 198.74828 H -39.166607 Z m 125.000195,0 H 125.83308 V 198.74828 H 85.833588 Z m 45.999462,0 H 250.83327 V 198.74828 H 131.83305 Z M -39.166607,204.74881 H 250.83327 v 89.99968 H -39.166607 Z"}
  //   ],

  //   // FLW04b
  //   [
  //     {id:4, name:"1_9AR_frame04plain.svg", d:"M -43.375742,1.3304065 V 301.33043 H 256.62429 V 1.3304065 Z m 5.000074,5.000074 H 18.624404 V 55.330212 h -57.000072 z m 63.000049,0 H 80.623996 V 55.330212 H 24.624381 Z m 62.000146,0 H 205.62419 V 55.330212 H 86.624527 Z m 124.999643,0 h 40.00004 V 55.330212 H 211.62417 Z M -38.375668,61.330192 H 80.623996 V 110.33047 H -38.375668 Z m 125.000195,0 h 39.999493 v 1.114557 A 61.000004,61.000004 0 0 0 86.624527,105.14023 Z m 74.188063,0 h 44.8116 V 109.4612 a 61.000004,61.000004 0 0 0 -44.8116,-48.131008 z m 50.81158,0 h 40.00004 v 49.000278 h -40.00004 z m -65.99976,4.000167 A 55.000004,55.000004 0 0 1 200.62412,120.33062 55.000004,55.000004 0 0 1 145.62441,175.33033 55.000004,55.000004 0 0 1 90.624143,120.33062 55.000004,55.000004 0 0 1 145.62441,65.330359 Z M -38.375668,116.33045 H 80.623996 v 61.44066 a 61.000004,61.000004 0 0 0 -12.999861,-1.44088 61.000004,61.000004 0 0 0 -30.046745,8.00034 h -75.953058 z m 249.999838,0 h 40.00004 v 68.00012 h -40.00004 z m -5.99998,14.68878 v 109.31096 h -73.0002 v -60.44076 a 61.000004,61.000004 0 0 0 13.00042,1.44088 61.000004,61.000004 0 0 0 59.99978,-50.31108 z m -118.999663,4.63628 a 61.000004,61.000004 0 0 0 39.999493,42.59516 v 43.75437 A 61.000004,61.000004 0 0 0 86.624527,179.41043 Z m -19.000392,46.6747 A 55.000004,55.000004 0 0 1 122.6244,237.33047 55.000004,55.000004 0 0 1 67.624135,292.3302 55.000004,55.000004 0 0 1 12.624424,237.33047 55.000004,55.000004 0 0 1 67.624135,182.33021 Z m -105.999803,8.00034 H 28.81417 a 61.000004,61.000004 0 0 0 -22.1897232,46.99992 61.000004,61.000004 0 0 0 0.1063837,2.99972 H -38.375668 Z m 249.999838,0 h 40.00004 v 49.99964 H 211.62417 Z M -38.375668,246.33017 H 7.3459875 a 61.000004,61.000004 0 0 0 45.0883095,50.00019 h -90.809965 z m 170.999658,0 h 73.0002 v 50.00019 h -73.0002 z m 79.00018,0 h 40.00004 v 50.00019 h -40.00004 z m -85.00015,6.19069 v 43.8095 H 86.624527 v -1.11402 a 61.000004,61.000004 0 0 0 39.999493,-42.69548 z"},
  //     {id:3, name:"1_9AR_frame03_development.svg", d:"M -44.166681,2.1213451 V 302.12137 H 255.83335 V 2.1213451 Z m 5.000074,5.000074 H 79.833057 V 56.121151 H -39.166607 Z m 125.000195,0 H 125.83308 V 56.121151 H 85.833588 Z m 45.999462,0 h 73.0002 V 56.121151 h -73.0002 z m 79.00018,0 h 40.00004 V 56.121151 H 210.83323 Z M -39.166607,62.121131 H 79.833057 V 111.12141 H -39.166607 Z m 125.000195,0 H 125.83308 V 111.12141 H 85.833588 Z m 45.999462,0 h 73.0002 v 49.000279 h -73.0002 z m 79.00018,0 h 40.00004 V 111.12141 H 210.83323 Z M -39.166607,117.12139 H 79.833057 V 297.1213 H -39.166607 Z m 125.000195,0 H 125.83308 V 251.12127 H 85.833588 Z m 45.999462,0 h 73.0002 v 133.99988 h -73.0002 z m 79.00018,0 h 40.00004 V 251.12127 H 210.83323 Z M 85.833588,257.12125 H 125.83308 V 297.1213 H 85.833588 Z m 45.999462,0 h 73.0002 v 40.00005 h -73.0002 z m 79.00018,0 h 40.00004 v 40.00005 h -40.00004 z"},
  //     {id:2, name:"1_9AR_frame02_development.svg", d:"M -49.550809,1.8601991 V 301.86023 H 250.44922 V 1.8601991 Z m 5.00007,5.00007 H 74.448929 V 296.86015 H -44.550739 Z m 125.000199,0 h 39.99949 V 296.86015 H 80.44946 Z m 45.99947,0 H 245.44914 V 296.86015 H 126.44893 Z"},
  //     {id:1, name:"1_9AR_frame01_development.svg", d:"M -44.166681,-1.0424093 V 298.95762 H 255.83335 V -1.0424093 Z m 5.000074,5.000074 H 79.833057 V 197.95734 H -39.166607 Z m 125.000195,0 H 125.83308 V 197.95734 H 85.833588 Z m 45.999462,0 H 250.83327 V 197.95734 H 131.83305 Z M -39.166607,203.95787 H 250.83327 v 89.99968 H -39.166607 Z"}
  //   ],

  //   // FLW05
  //   [
  //     {id:4, name:"1_9AR_frame04plain.svg", d:"M -44.166681,0.53946792 V 300.5395 H 255.83335 V 0.53946792 Z m 5.000074,5.00007398 H 29.833421 V 49.539199 h -69.000028 z m 75.000005,0 H 175.83326 V 49.539199 H 35.833398 Z m 146.999752,0 h 69.00004 V 49.539199 H 182.83315 Z M -39.166607,54.539274 h 69.000028 v 43.000305 h -69.000028 z m 74.000103,0 H 65.833291 V 97.539579 H 34.833496 Z m 36.999775,0 H 102.83307 V 97.539579 H 71.833271 Z m 36.999779,0 h 31.00034 v 43.000305 h -31.00034 z m 37.00032,0 h 30.9998 v 43.000305 h -30.9998 z m 36.99978,0 h 69.00004 V 97.539579 H 182.83315 Z M -39.166607,103.53956 h 68.000124 v 35.99987 45.45046 l -28.99998845,13.7881 v 96.76144 H -39.166607 v -92.99995 -63.00005 z m 74.000103,0 h 30.999795 v 46.99992 17.30872 l -30.999795,14.58956 v -31.89828 z m 36.999775,0 h 30.999799 v 46.99992 l -30.999799,14.55595 v -14.55595 z m 37.000329,0 h 30.99979 v 46.99992 14.55595 L 108.8336,150.53948 Z m 36.99977,0 h 30.9998 v 46.99992 31.89828 l -30.9998,-14.58956 v -17.30872 z m 36.99978,0 h 68.00012 v 35.99987 58.99988 97.00012 h -39.00013 v -96.76144 l -28.99999,-13.7881 v -45.45046 z m -80.00008,53.99981 v 45.00011 L 6.8334103,247.5396 v -45.00012 z m 6.00053,0 95.99965,45.00011 V 247.5396 L 108.8336,202.53948 Z m -6.00053,51.99999 v 34.00007 L 6.8334103,288.53955 v -34.00007 z m 6.00053,0 95.99965,45.00012 v 34.00007 L 108.8336,243.53943 Z m -6.00053,40.99995 v 45.00012 H 6.8334103 Z m 6.00053,0 95.99965,45.00012 H 108.8336 Z"},
  //     {id:3, name:"1_9AR_frame03_development.svg", d:"M -44.166681,2.1213451 V 302.12137 H 255.83335 V 2.1213451 Z M 6.8334103,7.1214191 H 102.83307 L 6.8334103,52.121534 Z m 102.0001897,0 h 95.99965 V 52.121534 Z M -39.166607,8.1213237 H -0.16647145 V 297.1213 H -39.166607 Z m 250.999747,0 h 39.00013 V 297.1213 H 211.83314 Z M 102.83307,13.99342 V 58.993533 L 6.8334103,103.99364 V 58.993533 Z m 6.00053,0 95.99965,45.000113 V 103.99364 L 108.8336,58.993533 Z m -6.00053,51.999997 V 99.99348 L 6.8334103,144.99359 v -34.00006 z m 6.00053,0 95.99965,45.000113 v 34.00006 L 108.8336,99.99348 Z m -6.00053,41.127823 v 45.00011 L 6.8334103,197.12147 v -45.00012 z m 6.00053,0 95.99965,45.00011 v 45.00012 L 108.8336,152.12135 Z m -6.00053,52 V 193.1213 L 6.8334103,238.12141 v -34.00006 z m 6.00053,0 95.99965,45.00011 v 34.00006 L 108.8336,193.1213 Z m -6.00053,40.99994 V 245.1213 L 6.8334103,290.12142 V 245.1213 Z m 6.00053,0 95.99965,45.00012 v 45.00012 L 108.8336,245.1213 Z m -6.00053,52 V 297.1213 H 6.8334103 Z m 6.00053,0 95.99965,45.00012 H 108.8336 Z"},
  //     {id:2, name:"1_9AR_frame02_development.svg", d:"M -44.166681,-0.25147069 V 299.74856 H 255.83335 V -0.25147069 Z m 5.000074,5.00007399 H 28.833517 V 294.74849 h -68.000124 z m 74.000103,0 H 65.833291 V 35.748399 H 34.833496 Z m 36.999775,0 H 102.83307 V 35.748399 H 71.833271 Z m 36.999779,0 h 31.00034 V 35.748399 h -31.00034 z m 37.00032,0 h 30.9998 V 35.748399 h -30.9998 z m 36.99978,0 h 68.00012 V 294.74849 H 182.83315 Z M 34.833496,41.748379 H 65.833291 V 72.748727 H 34.833496 Z m 36.999775,0 H 102.83307 V 72.748727 H 71.833271 Z m 36.999779,0 h 31.00034 v 31.000348 h -31.00034 z m 37.00032,0 h 30.9998 v 31.000348 h -30.9998 z M 34.833496,78.748706 H 65.833291 V 109.7485 H 34.833496 Z m 36.999775,0 H 102.83307 V 109.7485 H 71.833271 Z m 36.999779,0 h 31.00034 V 109.7485 h -31.00034 z m 37.00032,0 h 30.9998 V 109.7485 h -30.9998 z M 34.833496,115.74848 h 30.999795 v 31.00035 H 34.833496 Z m 36.999775,0 h 30.999799 v 31.00035 H 71.833271 Z m 36.999779,0 h 31.00034 v 31.00035 h -31.00034 z m 37.00032,0 h 30.9998 v 31.00035 h -30.9998 z M 34.833496,152.74881 h 30.999795 v 30.9998 H 34.833496 Z m 36.999775,0 h 30.999799 v 30.9998 H 71.833271 Z m 36.999779,0 h 31.00034 v 30.9998 h -31.00034 z m 37.00032,0 h 30.9998 v 30.9998 h -30.9998 z M 34.833496,189.74859 h 30.999795 v 30.99979 H 34.833496 Z m 36.999775,0 h 30.999799 v 30.99979 H 71.833271 Z m 36.999779,0 h 31.00034 v 30.99979 h -31.00034 z m 37.00032,0 h 30.9998 v 30.99979 h -30.9998 z M 34.833496,226.74836 h 30.999795 v 31.00035 H 34.833496 Z m 36.999775,0 h 30.999799 v 31.00035 H 71.833271 Z m 36.999779,0 h 31.00034 v 31.00035 h -31.00034 z m 37.00032,0 h 30.9998 v 31.00035 h -30.9998 z M 34.833496,263.74869 h 30.999795 v 30.9998 H 34.833496 Z m 36.999775,0 h 30.999799 v 30.9998 H 71.833271 Z m 36.999779,0 h 31.00034 v 30.9998 h -31.00034 z m 37.00032,0 h 30.9998 v 30.9998 h -30.9998 z"},
  //     {id:1, name:"1_9AR_frame01_development.svg", d:"M -44.166681,1.3304065 V 301.33043 H 255.83335 V 1.3304065 Z m 5.000074,5.000074 H 28.833517 V 148.3307 h -68.000124 z m 74.000103,0 H 65.833291 V 37.330276 H 34.833496 Z m 36.999775,0 H 102.83307 V 37.330276 H 71.833271 Z m 36.999779,0 h 31.00034 V 37.330276 h -31.00034 z m 37.00032,0 h 30.9998 V 37.330276 h -30.9998 z m 36.99978,0 h 68.00012 V 148.3307 H 182.83315 Z M 34.833496,43.330256 H 65.833291 V 74.330604 H 34.833496 Z m 36.999775,0 H 102.83307 V 74.330604 H 71.833271 Z m 36.999779,0 h 31.00034 v 31.000348 h -31.00034 z m 37.00032,0 h 30.9998 v 31.000348 h -30.9998 z M 34.833496,80.330583 H 65.833291 V 111.33037 H 34.833496 Z m 36.999775,0 H 102.83307 V 111.33037 H 71.833271 Z m 36.999779,0 h 31.00034 v 30.999787 h -31.00034 z m 37.00032,0 h 30.9998 v 30.999787 h -30.9998 z M 34.833496,117.33035 H 65.833291 V 148.3307 H 34.833496 Z m 36.999775,0 H 102.83307 V 148.3307 H 71.833271 Z m 36.999779,0 h 31.00034 v 31.00035 h -31.00034 z m 37.00032,0 h 30.9998 v 31.00035 h -30.9998 z m -184.999977,37.00033 h 69.000028 v 43.99966 h -69.000028 z m 75.000005,0 H 175.83326 v 43.99966 H 35.833398 Z m 146.999752,0 h 69.00004 v 43.99966 H 182.83315 Z M -39.166607,204.33032 H 65.833291 v 43.0003 H -39.166607 Z m 110.999878,0 h 68.000119 v 43.0003 H 71.833271 Z m 74.000099,0 h 104.9999 v 43.0003 H 145.83337 Z M -39.166607,253.3306 h 69.000028 v 42.99976 h -69.000028 z m 74.000103,0 h 30.999795 v 42.99976 H 34.833496 Z m 36.999775,0 h 30.999799 v 42.99976 H 71.833271 Z m 36.999779,0 h 31.00034 v 42.99976 h -31.00034 z m 37.00032,0 h 30.9998 v 42.99976 h -30.9998 z m 36.99978,0 h 69.00004 v 42.99976 h -69.00004 z"}
  //   ],

  //   // PRD_01
  //   [
  //     {id:4, name:"1_9AR_frame04plain.svg", d:"M -31.359093,-13.167506 V 286.83226 H 268.64068 V -13.167506 Z m 5.00021,5.0002101 h 43.9999 V 281.83256 h -43.9999 z m 49.99953,0 h 43.00048 V 281.83256 h -43.00048 z m 49.00011,0 H 115.64072 V 281.83256 H 72.640757 Z m 49.000113,0 h 42.99996 V 281.83256 h -42.99996 z m 49.00011,0 h 42.99996 V 281.83256 h -42.99996 z m 49.00011,0 h 43.99989 V 281.83256 h -43.99989 z"},
  //     {id:3, name:"1_9AR_frame03_development.svg", d:"M -44.16655,1.3305377 V 301.3303 H 255.83322 V 1.3305377 Z m 5.000212,5.0002117 H 4.8335604 V 296.3306 H -39.166338 Z m 49.999532,0 H 53.833668 V 88.480773 c -3.66001,2.116769 -7.037027,4.723907 -9.985954,7.770068 -8.290989,8.437799 -13.121132,20.096679 -13.191442,31.937579 .000129,-0.01 -0.0021,-0.0191 -0.0021,-0.0289 v 0.0543 c .00004,-0.009 0.0021,-0.0163 0.0021,-0.0248 -0.168532,12.38241 4.939209,24.79929 13.773837,33.47806 0.004,0.004 0.0058,0.008 0.0098,0.0119 2.159493,2.31354 4.470771,4.54081 6.562392,6.69158 a 121.71648,121.71648 0 0 1 0.01757,0.0191 l 2.813781,2.84065 V 296.3306 H 10.833194 Z m 33.01452,89.9200916 c 0.007,-0.007 0.01066,-0.01624 0.01757,-0.02326 l -0.03514,0.03721 c 0.005,-0.005 0.01238,-0.009 0.01757,-0.01394 z M 59.833302,6.3307494 H 102.83326 V 95.797639 C 101.014,93.78665 99.054087,91.93435 96.988657,90.270843 a 55.401254,55.401254 0 0 0 -0.03152,-0.02376 67.047969,67.047969 0 0 1 -0.02739,-0.02119 C 93.001865,87.142235 88.814878,83.145354 81.427849,82.325075 a 23.608862,23.608862 0 0 0 -0.02739,-0.0041 11.950343,11.950343 0 0 0 -0.03307,-0.0041 c -0.901568,-0.0909 -2.168096,-0.11475 -3.370337,-0.11007 v .00053 c -1.202229,0.005 -2.340377,0.0382 -2.985346,0.06149 a 76.688227,76.688227 0 0 0 -0.0155,0 44.214989,44.214989 0 0 0 -0.01757,0.0021 c -5.201338,0.216066 -10.333318,1.355031 -15.145329,3.287135 z m 49.000108,0 h 42.99996 V 85.899535 c -4.82203,-1.937076 -9.96096,-3.080457 -15.14584,-3.292822 0.0431,0.003 0.084,-0.0061 0.12712,-0.0021 l -0.25787,-0.0155 c 0.0421,0.0019 0.083,0.01437 0.12506,0.01704 -6.3364,-0.474456 -12.24415,1.790089 -16.87494,4.54701 a 40.929851,40.929851 0 0 0 -0.0233,0.01394 48.555005,48.555005 0 0 0 -0.0217,0.01344 c -4.04633,2.456262 -7.7352,5.528792 -10.92853,9.057328 z m 49.00011,0 h 42.99996 V 296.3306 H 157.83352 V 171.28966 c -1.99945,1.98102 -4.00004,3.96083 -6.00015,5.94073 V 296.3306 h -42.99996 v -76.817 c 1.23746,-0.72322 1.95848,-1.62341 2.0898,-1.77767 18.44331,-18.25539 36.85842,-36.53017 55.31186,-54.76514 9.16471,-8.47386 14.64655,-20.85277 14.77275,-33.32871 -.00005,0.008 0.002,0.0155 0.002,0.0233 l 0.002,-0.0568 c -.00011,0.011 -0.003,0.0221 -0.004,0.0331 0.21749,-11.86307 -4.33983,-23.66578 -12.4628,-32.308622 -3.10521,-3.357277 -6.73994,-6.221968 -10.71149,-8.513691 z m 10.71149,91.0021956 c 0.007,0.008 0.0166,0.01389 0.0238,0.0217 l -0.0393,-0.04082 c 0.006,0.006 0.01,0.01302 0.0155,0.01913 z M 206.83363,6.3307494 h 43.99989 V 296.3306 H 206.83363 Z M 77.998601,88.222391 c 1.088152,-0.004 2.176139,0.01315 2.76779,0.07286 5.37141,0.596458 8.271592,3.368804 12.458671,6.655924 5.477441,4.41157 10.108028,10.056105 12.730488,16.624305 0.4314,-1.09172 0.94231,-2.14915 1.48673,-3.18843 3.60784,-6.58677 9.0172,-12.175395 15.43265,-16.069823 4.03567,-2.40261 8.69441,-4.111522 13.45603,-3.725871 10.48868,0.39759 20.71111,5.132229 27.82982,12.840044 7.06718,7.51098 11.04659,17.81499 10.85205,28.12696 -0.1021,10.93655 -4.90029,21.72603 -12.96199,29.11916 -18.51665,18.29732 -36.99468,36.63566 -55.49636,54.94858 -0.4268,0.46028 -0.83293,0.97072 -1.52962,0.76946 L 55.303862,164.19243 c -2.20613,-2.26854 -4.529058,-4.48986 -6.660057,-6.78874 -7.71335,-7.57196 -12.143433,-18.34364 -11.988932,-29.15119 0.0552,-10.29312 4.270536,-20.47391 11.488187,-27.80967 7.055091,-7.295048 16.943435,-11.750534 27.085684,-12.171864 0.59318,-0.02141 1.681718,-0.04508 2.769857,-0.04857 z m -18.165299,89.065359 41.682728,42.0827 a 8.4023292,8.4023292 0 0 0 1.31723,0.59376 V 296.3306 H 59.833302 Z m 46.670018,43.07592 c -0.004,.0008 -0.008,0.002 -0.0129,0.003 0.004,-.00079 0.008,-0.002 0.0129,-0.003 z m -1.48983,0.077 c 0.0136,.00079 0.0262,-.00022 0.0398,.00053 -0.0137,-.00079 -0.0261,.00026 -0.0398,-.00053 z"},
  //     {id:2, name:"1_9AR_frame02_development.svg", d:"M -44.16655,-0.25133949 V 299.74843 H 255.83322 V -0.25133949 Z m 5.000212,5.00021169 H 250.83352 V 48.748771 H -39.166338 Z m 0,49.9995318 H 250.83352 V 97.748878 H -39.166338 Z m 0,49.000106 H 250.83352 v 42.99996 H -39.166338 Z m 0,49.00012 H 250.83352 v 42.99995 H -39.166338 Z m 0,49.0001 H 250.83352 v 42.99996 H -39.166338 Z m 0,49.00011 H 250.83352 v 43.99989 H -39.166338 Z"},
  //     {id:1, name:"1_9AR_frame01_development.svg", d:"M -43.375618,4.4942906 V 304.49406 H 256.62416 V 4.4942906 Z m 5.00021,5.00021 H 251.62446 V 53.494401 H -38.375408 Z m 0,49.9995304 H 251.62446 v 43.000479 h -80.25814 c -0.76854,-0.94124 -1.56548,-1.85969 -2.40967,-2.736789 -8.23502,-8.69436 -20.04358,-13.99998 -32.03319,-14.34744 -0.3964,-0.025 -0.7913,-0.0393 -1.18391,-0.0434 -5.88916,-0.0621 -11.32909,2.15614 -15.63884,4.79144 a 40.98109,40.98109 0 0 0 -0.0212,0.0139 48.546877,48.546877 0 0 0 -0.0217,0.0134 c -5.14935,3.20979 -9.69455,7.42762 -13.35681,12.308809 h -0.52142 c -2.61209,-3.369779 -5.60453,-6.393529 -8.855788,-8.949319 a 55.407538,55.407538 0 0 0 -0.0315,-0.0253 67.185775,67.185775 0 0 1 -0.0294,-0.0217 c -3.96454,-3.03735 -8.19773,-6.98194 -15.59337,-7.71476 a 23.611969,23.611969 0 0 0 -0.0274,-0.002 11.963751,11.963751 0 0 0 -0.0331,-0.004 c -1.80353,-0.16033 -5.06481,-0.0366 -6.35568,0.0253 a 74.242826,74.242826 0 0 0 -0.0155,0 44.206186,44.206186 0 0 0 -0.0176,0 c -11.66905,0.62304 -22.94238,5.86921 -30.96091,14.349509 -0.7235,0.75385 -1.40936,1.54064 -2.07739,2.34198 h -80.55736 z m 82.63475,40.658499 c 0.006,-0.006 0.009,-0.0153 0.0155,-0.0217 l -0.0351,0.0372 c 0.006,-0.006 0.0139,-0.009 0.0196,-0.0155 z M 136.92346,85.410281 c 0.0452,0.003 0.0876,-0.007 0.13281,-0.004 l -0.25787,-0.0114 c 0.0421,0.001 0.083,0.0143 0.12506,0.0155 z m 32.03319,14.34744 c 0.008,0.008 0.0177,0.0137 0.0253,0.0217 l -0.0393,-0.0393 c 0.005,0.005 0.009,0.0122 0.0139,0.0176 z m -33.20573,-8.38501 c 0.29675,0.005 0.59407,0.0171 0.89194,0.0377 10.49264,0.27354 20.76981,4.88673 27.97917,12.509829 0.80302,0.83347 1.55392,1.714 2.27841,2.61483 0.24303,0.30273 0.4724,0.61585 0.70642,0.92552 5.28236,6.98152 8.2607,15.68941 8.19898,24.45639 0.017,6.82929 -1.79838,13.62255 -5.10511,19.58537 -0.53924,0.97237 -1.12751,1.9165 -1.7446,2.84117 -0.0812,0.12164 -0.15882,0.24563 -0.24133,0.36639 -0.59807,0.87535 -1.23521,1.72355 -1.90117,2.54868 -1.11949,1.38702 -2.32299,2.70666 -3.62459,3.92896 -12.93636,13.08906 -25.85087,26.20032 -38.77024,39.30664 h -0.007 c -1.97177,2.00027 -3.94394,4.00009 -5.91592,6.00015 h 0.004 c -3.38379,3.43201 -6.76832,6.86324 -10.15339,10.29394 -0.42131,0.46529 -0.82182,0.98056 -1.52083,0.78756 l -11.237548,-11.0815 -6.0849,-6.00016 -32.9887,-32.5298 c -2.2328,-2.24229 -4.58161,-4.43614 -6.73964,-6.70966 -1.29283,-1.23946 -2.4876,-2.5751 -3.59616,-3.97806 -0.6248,-0.79083 -1.21781,-1.60594 -1.78077,-2.44171 -0.53179,-0.78895 -1.01741,-1.60742 -1.49241,-2.43189 -0.16533,-0.28707 -0.35327,-0.56063 -0.5116,-0.85163 -3.20798,-5.89556 -4.96876,-12.58151 -4.95216,-19.30425 -0.0559,-8.64102 2.85221,-17.21547 7.9959,-24.14271 0.98229,-1.32445 2.01912,-2.61025 3.16311,-3.8008 6.96834,-7.377959 16.80341,-11.949999 26.93997,-12.491229 1.18577,-0.0569 4.35248,-0.14665 5.53713,-0.0413 5.37809,0.53291 8.31105,3.27127 12.5367,6.50865 1.75249,1.37762 3.40756,2.893459 4.95577,4.511349 0.73995,0.77339 1.455338,1.57002 2.135788,2.3952 0.075,0.0909 0.15473,0.17776 0.22893,0.26924 0.74652,0.92095 1.44844,1.87622 2.11098,2.85771 1.3684,2.02695 2.5584,4.17162 3.49487,6.43888 0.41847,-1.09674 0.9164,-2.16037 1.44849,-3.20601 0.62371,-1.17136 1.3231,-2.29952 2.0557,-3.40599 0.53191,-0.8037 1.09205,-1.58808 1.6769,-2.35438 0.17056,-0.22307 0.33926,-0.44743 0.51417,-0.66714 0.69113,-0.86964 1.40891,-1.71859 2.16576,-2.53215 2.60869,-2.803809 5.58299,-5.268229 8.82892,-7.291539 3.75655,-2.29703 8.06845,-3.99085 12.51965,-3.92224 z M -38.375408,108.49414 h 76.32144 c -4.23,7.14454 -6.54974,15.41129 -6.50141,23.74635 -0.0125,6.61854 1.49452,13.22368 4.25297,19.2536 h -74.073 z m 69.82003,23.74635 c 2e-5,-0.009 -0.002,-0.0168 -0.002,-0.0253 v 0.0543 c -6e-5,-0.01 0.002,-0.0191 0.002,-0.0289 z M 175.52369,108.49414 h 76.10077 v 42.99995 h -74.22957 c 2.85778,-6.11712 4.42157,-12.8417 4.40904,-19.58175 0.0519,-8.20222 -2.18079,-16.34712 -6.28024,-23.4182 z m 6.28024,23.4182 c -8e-5,0.0105 0.002,0.0205 0.002,0.031 v -0.0584 c 2e-5,0.009 -0.002,0.0182 -0.002,0.0274 z m -220.179338,25.58191 h 77.36376 c 1.89495,2.92703 4.1049,5.64628 6.6182,8.05842 2.19174,2.29434 4.53459,4.49819 6.65644,6.62906 a 120.84948,120.84948 0 0 1 0.0196,0.0176 l 28.69283,28.29491 h -119.35083 z m 212.413398,0 h 77.58647 v 42.99996 H 132.83017 c 11.5248,-11.69316 23.04654,-23.39086 34.58549,-35.06608 2.50805,-2.37332 4.7191,-5.05032 6.62233,-7.93388 z m -212.413398,49.00011 h 125.43525 l 16.316308,16.08997 a 8.4198546,8.4198546 0 0 0 1.85157,0.75758 c 4.53984,1.25356 7.18526,-2.07965 7.51582,-2.48203 4.72453,-4.7883 9.44684,-9.57531 14.16864,-14.36552 h 124.71228 v 42.99996 H -38.375408 Z m 0,49.00011 H 251.62446 v 43.99989 H -38.375408 Z"}
  //   ],

  //   // RLG_01
  //   [
  //     {id:4, name:"1_9AR_frame04plain.svg", d:"M 1e-5,0 V 299.99977 H 299.99978 V 0 Z m 5.00021,5.00021 h 14.9996 260.00016 15.0001 v 14.9996 275.00026 h -15.0001 V 19.99981 H 19.99982 V 295.00007 H 5.00022 V 19.99981 Z m 20.99975,20.99975 h 39.00021 5.99963 6.00015 2.99982 20.00033 21.99969 6.00015 10.34045 c -13.14224,8.01756 -26.01722,16.49252 -36.68406,27.06708 -0.0372,-0.0223 -0.0744,-0.0449 -0.11162,-0.0672 l -0.25684,0.42789 c -6.97973,6.98428 -12.9949,14.884 -17.48885,24.17165 -4.90984,10.14716 -7.93471,21.74541 -9.80044,34.22633 C 72.13269,99.34522 69.11038,87.74619 64.20074,77.59938 55.81345,60.26526 42.06436,47.73937 26.71776,37.02614 a 3.0000045,3.0000045 0 0 0 -0.71779,-0.31419 z m 123.95161,0 h 0.0946 c 15.54904,9.33146 30.80042,18.59537 42.95345,30.28188 -15.50785,9.35535 -30.89838,19.12931 -42.99841,32.00889 C 137.90064,75.41049 122.50885,65.63658 107.00023,56.2808 119.15258,44.59465 134.40298,35.33119 149.95161,25.99996 Z m 11.70833,0 H 171.99984 178 h 16.99999 15.00012 12.99972 6.00015 10.99985 33.99998 v 10.71253 a 3.0000045,3.0000045 0 0 0 -0.71776,0.31471 c -15.34623,10.71304 -29.09536,23.23854 -37.48248,40.5722 -4.91041,10.14835 -7.93315,21.74937 -9.79889,34.23201 -1.866,-12.48306 -4.89089,-24.08333 -9.80147,-34.23201 -4.49239,-9.28444 -10.50477,-17.18192 -17.4811,-24.16442 l -0.26097,-0.43512 c -0.0377,0.0226 -0.0754,0.0456 -0.11317,0.0682 C 187.67737,42.49291 174.80249,34.01784 161.65991,25.99994 Z M 25.99997,43.9136 c 13.74916,9.94648 25.51828,21.25129 32.79955,36.29959 11.9906,24.78112 12.19948,61.04441 12.20029,97.63435 V 295.00007 H 25.99997 Z m 247.99984,5.3e-4 V 295.00007 H 228.99998 V 178.07233 c 0,-36.66636 0.18552,-73.02714 12.20081,-97.85914 7.28109,-15.04783 19.05028,-26.35277 32.79902,-36.29907 z M 102.68676,60.68675 c 16.02318,9.65974 31.48919,19.45765 43.30279,32.14894 -4.32133,5.20783 -8.1152,10.90824 -11.19054,17.26406 -12.4448,25.71977 -12.78621,60.75155 -12.79353,95.90009 h -0.006 v 89.00023 H 76.99996 V 178.0775 a 3.0000045,3.0000045 0 0 0 5.3e-4,-0.005 c 0,-0.0848 -5.3e-4,-0.16946 -5.3e-4,-0.25425 7.9e-4,-36.58007 0.21383,-72.83084 12.20132,-97.60541 3.52926,-7.29392 8.12677,-13.71154 13.48548,-19.52594 z m 94.62678,5.3e-4 c 5.35867,5.81421 9.95637,12.23179 13.48549,19.52542 12.01528,24.83201 12.2008,61.19329 12.2008,97.85966 V 295.00009 H 178 v -84.42793 h 0.002 c 0,-0.53922 -0.002,-1.07764 -0.002,-1.61696 v -2.95537 h -0.004 c -0.007,-35.14854 -0.3482,-70.18035 -12.79301,-95.90009 -3.07542,-6.35599 -6.86958,-12.05664 -11.19105,-17.26458 11.81323,-12.69079 27.27866,-22.4885 43.30123,-32.14791 z m -47.31235,36.74605 c 3.79572,4.6654 7.10818,9.71772 9.7994,15.27968 11.71494,24.21133 12.1831,59.38398 12.19925,95.11203 v 87.17503 h -43.99989 v -84.42791 c 0,-36.66637 0.18602,-73.02703 12.20132,-97.85915 2.69123,-5.56198 6.00418,-10.61427 9.79992,-15.27968 z"},
  //     {id:3, name:"1_9AR_frame03_development.svg", d:"M 0 0 L 0 1133.8574 L 1133.8574 1133.8574 L 1133.8574 0 L 0 0 z M 18.898438 18.898438 L 75.589844 18.898438 L 75.589844 1114.9609 L 18.898438 1114.9609 L 18.898438 18.898438 z M 98.267578 18.898438 L 268.3457 18.898438 L 268.3457 1114.9609 L 98.267578 1114.9609 L 98.267578 18.898438 z M 291.02344 18.898438 L 461.10156 18.898438 L 461.10156 398.4668 L 393.07031 398.4668 L 393.07031 498.49219 L 461.10156 498.49219 L 461.10156 1114.9609 L 291.02344 1114.9609 L 291.02344 18.898438 z M 483.7793 18.898438 L 650.07812 18.898438 L 650.07812 398.4668 L 627.40234 398.4668 L 627.40234 34.015625 L 506.45703 34.015625 L 506.45703 398.4668 L 483.7793 398.4668 L 483.7793 18.898438 z M 672.75586 18.898438 L 842.83398 18.898438 L 842.83398 1114.9609 L 672.75586 1114.9609 L 672.75586 498.49219 L 740.78711 498.49219 L 740.78711 398.4668 L 672.75586 398.4668 L 672.75586 18.898438 z M 865.51172 18.898438 L 1035.5898 18.898438 L 1035.5898 1114.9609 L 865.51172 1114.9609 L 865.51172 18.898438 z M 1058.2676 18.898438 L 1114.9609 18.898438 L 1114.9609 1114.9609 L 1058.2676 1114.9609 L 1058.2676 18.898438 z M 529.13477 56.693359 L 604.72461 56.693359 L 604.72461 421.14648 L 650.07812 421.14648 L 672.75586 421.14648 L 718.10938 421.14648 L 718.10938 475.81641 L 672.75586 475.81641 L 650.07812 475.81641 L 604.72461 475.81641 L 604.72461 1077.1641 L 529.13477 1077.1641 L 529.13477 475.81641 L 483.7793 475.81641 L 461.10156 475.81641 L 415.74805 475.81641 L 415.74805 421.14648 L 461.10156 421.14648 L 483.7793 421.14648 L 529.13477 421.14648 L 529.13477 56.693359 z M 483.7793 498.49219 L 506.45703 498.49219 L 506.45703 1099.8418 L 627.40234 1099.8418 L 627.40234 498.49219 L 650.07812 498.49219 L 650.07812 1114.9609 L 483.7793 1114.9609 L 483.7793 498.49219 z"},
  //     {id:2, name:"1_9AR_frame02_development.svg", d:"M 0,0 V 299.99977 H 299.99977 V 0 Z M 5.0002117,5.0002117 H 19.999813 V 295.00007 H 5.0002117 Z m 20.9997513,0 H 70.999799 V 44.500125 c 0,26.666372 -0.21821,52.970257 -9.632487,70.230345 -7.286111,13.35831 -20.498019,22.2595 -35.367349,30.23898 z m 50.999988,0 H 121.99979 V 144.96893 C 107.13117,136.98952 93.921058,128.08864 86.63502,114.73047 77.220743,97.470387 76.999951,71.166497 76.999951,44.500125 Z m 50.999989,0 h 43.99989 V 295.00007 h -43.99989 z m 50.00005,0 h 44.99983 V 44.500125 c 0,26.666372 -0.2182,52.97026 -9.63249,70.230345 -7.2861,13.35832 -20.49802,22.2595 -35.36734,30.23898 z m 50.99998,0 H 273.9998 V 144.96893 c -14.86861,-7.97942 -28.07872,-16.88029 -35.36476,-30.23846 -9.41428,-17.26008 -9.63507,-43.563973 -9.63507,-70.230345 z m 51,0 h 15.0001 V 295.00007 h -15.0001 z M 74.00065,95.978637 c 1.535981,7.852033 3.843989,15.166933 7.366476,21.625043 7.607943,13.94835 20.444954,23.12445 34.489364,30.8963 -14.04441,7.77186 -26.881421,16.94795 -34.489364,30.89631 -3.522487,6.4581 -5.830495,13.77299 -7.366476,21.62503 -1.535673,-7.85204 -3.843472,-15.16693 -7.365957,-21.62503 -7.608195,-13.94881 -20.446982,-23.12433 -34.49247,-30.89631 14.045488,-7.77197 26.884275,-16.9475 34.49247,-30.8963 3.522485,-6.45811 5.830284,-13.77301 7.365957,-21.625043 z m 152.00002,0.07597 c 1.5361,7.826693 3.85397,15.109253 7.36648,21.549083 7.60805,13.94856 20.44523,23.12436 34.48987,30.89629 -14.04455,7.77191 -26.88186,16.94783 -34.48987,30.89631 -3.51251,6.43981 -5.83038,13.72238 -7.36648,21.54907 -1.53579,-7.82669 -3.85344,-15.10926 -7.36596,-21.54907 -7.60818,-13.94881 -20.44698,-23.12432 -34.49246,-30.89631 14.04548,-7.77197 26.88428,-16.94748 34.49246,-30.89629 3.51252,-6.43982 5.83017,-13.72239 7.36596,-21.549083 z M 25.999963,152.03052 c 14.86933,7.97947 28.081238,16.88066 35.367349,30.23898 9.414277,17.26008 9.632487,43.56396 9.632487,70.23033 v 42.50024 H 25.999963 Z m 152.000027,0 c 14.86932,7.97948 28.08124,16.88067 35.36734,30.23898 9.41429,17.26008 9.63249,43.56396 9.63249,70.23033 v 42.50024 h -44.99983 z m -56.0002,5.3e-4 V 295.00007 H 76.999951 v -42.50024 c 0,-26.66637 0.220792,-52.97025 9.635069,-70.23033 7.286038,-13.35818 20.49615,-22.25906 35.36477,-30.23847 z m 152.00001,0 v 142.96902 h -44.99983 v -42.50024 c 0,-26.66637 0.22079,-52.97025 9.63507,-70.23033 7.28604,-13.35817 20.49615,-22.25906 35.36476,-30.23847 z"},
  //     {id:1, name:"1_9AR_frame01_development.svg", d:"M 0 0 L 0 1133.8574 L 1133.8574 1133.8574 L 1133.8574 0 L 0 0 z M 18.898438 18.898438 L 75.589844 18.898438 L 1058.2676 18.898438 L 1114.9609 18.898438 L 1114.9609 75.589844 L 1114.9609 1114.9609 L 1058.2676 1114.9609 L 1058.2676 75.589844 L 75.589844 75.589844 L 75.589844 1114.9609 L 18.898438 1114.9609 L 18.898438 75.589844 L 18.898438 18.898438 z M 98.267578 98.267578 L 268.3457 98.267578 L 268.3457 1114.9609 L 98.267578 1114.9609 L 98.267578 98.267578 z M 291.02344 98.267578 L 461.10156 98.267578 L 461.10156 1114.9609 L 291.02344 1114.9609 L 291.02344 98.267578 z M 483.7793 98.267578 L 650.07812 98.267578 L 650.07812 1114.9609 L 483.7793 1114.9609 L 483.7793 98.267578 z M 672.75586 98.267578 L 842.83398 98.267578 L 842.83398 1114.9609 L 672.75586 1114.9609 L 672.75586 98.267578 z M 865.51172 98.267578 L 1035.5898 98.267578 L 1035.5898 1114.9609 L 865.51172 1114.9609 L 865.51172 98.267578 z"}
  //   ],

  //   // FWR_01
  //   [
  //     {id:4, name:"1_9AR_frame01_development.svg", d:"M 0 0 L 0 1062.9922 L 1062.9922 1062.9922 L 1062.9922 0 L 0 0 z M 17.716797 17.716797 L 770.45898 17.716797 C 756.30521 25.586947 740.99142 33.508257 663.8457 44.117188 L 470.57422 59.347656 C 412.50971 54.804892 307.55469 93.073523 185.39258 147.05469 C 124.20391 125.76288 118.33962 155.98031 138.125 210.07812 C 93.35081 339.69209 124.27338 342.51421 133.39844 363.95898 C 79.996515 439.91079 75.718374 488.76004 103.46289 519.94141 L 17.716797 519.41602 L 17.716797 17.716797 z M 809.84961 17.716797 L 1045.2754 17.716797 L 1045.2754 495.7832 C 995.78643 468.73143 957.87434 423.15679 922.24023 373.9375 C 1067.728 277.74607 906.85042 193.64876 860.26758 105.03906 L 809.84961 17.716797 z M 793.42773 32.90625 L 846.98633 127.97656 C 872.03377 159.3812 899.31915 189.00825 925.31055 219.64258 C 937.93147 238.10074 950.39574 257.22815 956.98047 278.78711 C 964.01369 297.48059 955.84349 318.65441 942.13086 332.25977 C 932.88376 338.24208 924.33013 345.4249 914.9668 351.30664 C 909.48033 355.59755 902.5689 356.02219 895.88672 355.72266 C 879.88106 361.66819 865.73193 371.66104 851.56445 381.03711 C 839.32221 387.85413 829.19417 398.34184 815.90234 403.19531 C 804.70045 405.93475 791.52816 403.27351 782.90625 395.3457 C 779.22465 385.15723 785.95489 374.75981 784.39844 364.21094 C 776.04893 335.30553 767.82026 306.22947 757.47852 277.91797 C 750.36021 255.81762 737.04405 236.59548 724.7793 217.11914 C 708.01367 192.82939 693.0103 166.06135 668.50586 148.54688 C 652.64739 136.13941 632.98128 130.91169 614.01172 125.38867 C 597.16776 119.35655 579.85574 126.6909 563.18359 128.5625 C 554.54646 130.17103 545.55412 127.70314 539.2832 121.47656 C 523.76825 106.02607 507.17502 90.448349 486.60156 81.736328 C 505.33047 80.177744 523.99126 77.817887 542.6543 75.740234 C 587.83986 69.634788 633.40372 68.500665 678.95508 66.628906 C 711.82202 59.774879 744.16653 50.313129 776.69336 41.986328 L 793.42773 32.90625 z M 431.39648 92.216797 C 454.52817 91.908688 477.95795 99.46763 496.94727 112.89258 C 517.94334 129.12682 536.59481 148.17092 554.64062 167.55664 C 597.38761 214.72923 632.92347 271.75418 643.40039 335.41211 C 647.52634 355.78531 642.20055 376.5499 633.29688 395.18164 C 621.26881 421.34456 604.16514 446.44173 600.41602 475.64062 C 598.01516 490.01908 609.42985 503.42739 604.11328 517.54688 C 592.40701 536.50162 569.98603 544.53296 549.64062 550.47656 C 530.27333 555.20353 511.54799 562.29772 492.46289 567.76953 C 464.54822 574.15369 434.13685 576.77882 406.875 566.9082 C 395.66632 563.72572 384.00014 553.10817 387.02344 540.48047 C 436.20532 517.20863 489.29924 502.28801 538.16211 477.92578 C 549.43874 471.41152 562.71976 466.80951 570.9707 456.22266 C 581.57065 437.82636 583.58727 415.97592 585.38086 395.20898 C 586.57071 370.81154 588.92556 345.89436 583.76758 321.77734 C 574.14067 285.12775 546.82754 256.4454 518.39648 232.91016 C 512.08238 225.06185 501.21847 226.47526 492.7793 223.03906 C 485.68337 215.05501 480.95416 205.16401 474.29883 196.76953 C 461.45187 177.68325 438.66144 168.80579 416.86914 164.83594 C 400.59536 162.46535 383.34056 158.73444 367.20703 163.96484 C 335.12652 178.64944 305.20933 197.73763 276.51172 218.17969 C 280.93165 203.26809 285.30263 188.36681 290.75391 173.77539 C 299.00857 153.76668 307.08809 130.99773 326.16211 118.875 C 359.90663 105.78097 394.85555 92.727631 431.39648 92.216797 z M 290.47852 126.85742 C 288.67553 129.65945 286.35422 133.24806 283.76172 135.88086 C 272.35514 161.11514 264.88033 187.98011 256.75781 214.42578 C 254.44635 219.85591 253.14937 225.50884 253.76367 231.44922 C 249.63653 242.17459 240.34645 250.42284 232.26172 258.54102 C 215.8393 272.64116 202.97359 290.11636 190.99023 307.99023 C 180.68047 320.83956 173.74506 338.05043 158.09961 345.52539 C 151.68703 349.29207 142.16394 347.38766 139.98438 339.55273 C 131.98457 297.86561 149.49887 257.72811 157.42383 217.28516 C 161.61502 205.50691 155.50819 193.57522 150.4375 183.16992 C 147.6414 176.94218 143.47054 167.21274 150.29688 162.29688 C 165.10666 161.27113 178.85733 172.53377 193.91016 168.66992 C 226.10962 154.80632 256.63379 136.76927 290.47852 126.85742 z M 592.08984 146.09766 C 610.82659 146.303 629.14553 152.53507 645.0957 162.16406 C 665.59978 173.41169 678.91852 193.26642 690.98633 212.5918 C 701.19323 229.30837 713.58175 244.59334 723.44531 261.51367 C 733.03742 287.50658 742.13741 313.74127 751.75586 339.75781 C 759.75066 355.51061 759.40881 373.54818 758.69727 390.73047 C 761.07343 410.87081 755.03393 430.60057 749.23047 449.63867 C 742.85007 451.26297 737.03497 454.46564 731.36914 457.72656 C 716.16731 471.40256 703.99653 488.15333 690.3418 503.35352 C 675.80803 517.4882 664.756 537.0284 644.81836 544.39453 C 639.81868 537.75454 635.91152 530.35923 632.69531 522.71289 C 627.31773 507.28315 619.88094 491.37817 621.63477 474.61914 C 625.52953 457.8886 634.35109 442.76677 641.75586 427.38867 C 649.05982 411.60205 657.22583 396.19126 663.89453 380.125 C 668.79516 361.34435 667.09318 341.49297 663.92383 322.40625 C 651.60601 256.52095 612.38131 199.20468 568.60742 149.70898 C 576.43497 148.50572 584.26236 147.30138 592.08984 146.09766 z M 384.05078 183.09375 C 392.38507 183.00516 400.64025 183.36185 408.85547 184.50781 C 431.86887 186.66179 455.48096 199.39567 464.63281 221.61523 C 460.02747 222.32621 455.40801 222.94104 450.8125 223.71484 C 422.77786 227.02623 399.6122 246.14354 383.3418 268.15039 C 378.18968 273.48572 376.25157 281.76755 369.43555 285.33789 C 348.56443 294.20478 325.34932 297.66496 305.77148 309.76367 C 297.34275 315.50513 287.25671 321.16637 283.92969 331.46875 C 272.74682 368.76842 285.31332 411.0188 311.92188 438.80078 C 307.50302 440.39495 302.50223 441.4585 297.72852 442.23047 C 267.5477 447.57406 238.09423 432.40726 215.86133 413.28711 C 203.75803 401.52083 188.03563 390.60026 183.98438 373.20312 C 185.48862 360.49629 191.74064 348.60741 197.7793 337.40039 C 232.43874 277.8782 286.81867 231.75183 346.84375 199.22266 C 359.1857 193.6959 370.47496 185.29465 384.05078 183.09375 z M 262.73047 235.51562 C 266.77212 235.45102 265.58203 238.58917 262.73047 235.51562 z M 480.30664 242.77734 C 490.37069 242.66364 500.60098 244.6915 508.20508 251.8457 C 534.49166 272.12927 558.2806 299.27892 563.64453 332.99023 C 555.67097 340.70819 544.54994 346.06741 534.17383 350.64258 C 526.61583 337.40466 519.4323 323.92085 510.92188 311.25586 C 503.84825 301.88071 497.82235 290.74979 487.23828 284.86328 C 460.60427 272.37315 429.6878 275.78698 402 282.71094 C 406.34402 276.86581 411.28781 271.47316 416.67773 266.57812 C 432.7537 250.35763 455.91138 243.71822 478.29688 242.82812 C 478.96551 242.8024 479.6357 242.78492 480.30664 242.77734 z M 452.83398 297.63281 C 463.58387 298.67856 474.86905 302.07267 482.97656 309.71484 C 496.65127 327.59453 507.26829 347.72634 519.67188 366.5332 C 498.28483 383.33235 476.44342 399.64961 456.51758 418.20508 C 451.97138 421.30296 448.81374 426.06754 444.40039 429.24023 C 443.5357 427.00932 443.76778 423.69899 442.3125 421.32422 C 435.6673 410.69638 431.25845 397.82393 420.55859 390.37305 C 434.11552 386.69297 448.72478 381.13666 460.39844 372.26562 C 471.65026 365.4332 469.7962 350.84571 472.75781 339.8418 C 471.61723 324.24754 465.03735 308.48616 453.19727 297.94141 L 452.83398 297.63281 z M 422.48438 302.91992 C 427.66017 303.56535 432.16706 308.19262 436.41797 311.29102 C 449.82701 320.94328 454.77178 340.55556 446.07031 354.92383 C 431.95708 369.11782 411.6827 375.18013 392.43164 378.79688 C 386.53902 381.2971 380.5976 378.19447 376.38867 374.05664 C 366.75024 368.33131 364.50567 355.54869 369.21484 345.91406 C 377.13044 323.01075 399.93667 309.4246 422.01172 303.05273 L 422.48438 302.91992 z M 370.0293 308.98828 C 356.95844 316.93758 351.45633 331.65979 345.47461 345.25 C 340.24346 350.55228 343.28488 360.07775 345.55078 366.61328 C 348.60945 382.75848 361.79786 395.57993 377.41406 399.84961 C 383.36111 402.51721 389.73509 401.34064 395.96875 401.40234 C 412.27858 407.84472 422.90293 423.74796 429.92188 439.06055 L 411.77148 444.375 C 401.168 449.02839 389.93332 448.78487 378.66602 448.03516 C 369.274 448.79526 359.67847 447.51537 351.50586 442.48242 C 320.17328 426.96799 303.64104 391.74408 302.46484 358.0625 C 301.44818 347.04947 302.41305 333.49659 312.92578 326.97656 C 330.23238 319.49088 349.02399 315.99438 366.89648 310.00391 L 370.0293 308.98828 z M 564.82812 360.07617 C 565.2769 376.14639 563.91723 392.27482 561.35938 408.20312 C 558.35639 424.25597 555.63777 443.28957 541.12109 453.33203 C 480.89591 482.92341 416.87419 503.59998 355.03125 529.43164 C 343.79243 532.86866 334.06389 540.54473 322.29297 542.20117 C 304.58963 541.73371 288.79071 531.85705 274.19336 522.7168 C 254.02379 508.50221 232.80398 495.42432 214.73633 478.58398 C 194.21808 458.26833 174.63297 432.07799 176.91797 401.89453 C 190.46892 420.00577 206.37158 436.81657 225.83789 448.61719 C 257.1181 468.46277 297.89422 468.68892 331.29883 454.09766 C 339.51032 459.85659 348.94927 465.55228 359.26367 467.37695 C 390.03347 474.31903 420.10171 460.69891 449.375 453.25586 C 467.48381 439.58269 484.36167 424.14379 501.73047 409.47852 C 522.28711 392.91001 541.66419 374.63891 564.07031 360.52734 L 564.82812 360.07617 z M 162.93945 366.80469 C 155.17335 392.08136 148.96174 420.49747 159.54297 445.91992 C 167.6284 462.59345 180.75299 476.22904 193.57227 489.375 C 226.57954 521.56785 264.79454 550.83336 309.74219 563.68164 C 325.83831 569.75177 342.66585 562.09728 356.88086 554.67773 C 359.04414 554.14419 363.08074 550.41638 364.28125 551.58008 C 368.51678 568.47427 383.81805 579.47903 398.21484 587.60938 C 415.59451 593.8496 434.52996 594.45358 452.85352 593.99023 C 468.76366 594.42321 484.36905 590.31372 499.96094 588.61719 C 522.9011 589.16328 548.04444 592.27851 566.22461 607.63086 C 538.87482 624.89487 511.04021 641.64798 481.33984 654.5957 C 454.04116 665.95947 424.9526 677.04273 395.14844 674.48242 C 314.68312 672.22007 233.86246 648.33126 168.43945 600.48047 L 118.79102 496.59375 C 115.79165 488.3548 110.34954 481.2933 107.9375 472.9375 C 113.95326 433.32551 132.76344 394.89348 162.11328 367.56055 L 162.11328 367.55859 L 162.20117 367.47852 L 162.93945 366.80469 z M 896.11133 380.09375 C 904.79876 388.31529 912.01775 398.01514 919.54297 407.375 C 951.77154 446.14818 984.25604 486.39191 1027.1582 513.92773 C 1022.7728 518.28321 1018.5766 522.83162 1014.6211 527.58203 C 988.55885 557.01106 976.16895 598.64578 984.55273 637.33008 L 823.77148 687.26367 C 779.77021 701.48796 735.43269 714.80689 690.42773 725.33203 C 671.33947 731.50276 651.29546 732.53033 631.39648 733.26172 C 614.58477 735.66825 598.22977 730.80347 581.98828 726.94922 C 607.37672 714.74433 633.58507 704.10769 657.9375 689.84766 C 689.64984 669.28425 721.46225 648.83485 753.65039 628.97656 C 802.09634 598.02121 852.44424 568.14347 891.82031 525.55664 C 896.61687 521.04332 903.46315 513.6782 898.7207 506.80664 C 881.23018 493.24729 861.04502 483.3325 841.0625 473.89062 C 818.96058 466.02204 796.07028 460.35987 773.70703 453.19531 C 776.62896 443.65709 779.62635 434.13798 782.21484 424.50195 C 789.41699 423.4871 796.78562 424.9885 804.10352 425.38281 C 821.53911 427.70335 838.40477 420.09717 852.03906 409.79688 C 867.1223 400.37984 878.76274 385.4279 896.11133 380.09375 z M 752.77539 472.32617 C 755.47564 472.35837 758.19096 472.67676 760.86523 473.00586 C 799.64721 481.20933 838.1156 493.69912 872.02734 514.62891 C 854.78196 534.40254 833.59416 550.19053 811.97656 564.83789 C 744.20483 608.35826 678.08911 654.94523 606.2168 691.64258 C 564.32035 711.43946 521.25731 732.15862 474.52734 736.7168 C 428.74013 740.03628 385.29797 721.64163 343.59961 705.28516 C 334.21225 702.48637 323.47581 698.6657 319.46289 688.63477 C 338.88904 691.14828 358.33184 693.17274 377.91797 694.30078 C 408.96362 697.60577 439.89288 690.33266 469.66211 681.88477 C 506.04568 667.35652 541.2433 649.42106 573.47656 627.09375 C 581.95626 620.71871 593.06061 611.01713 588.79688 599.1582 C 581.76526 586.14133 566.28491 581.43423 553.84961 575.18945 C 551.5298 574.38101 545.50754 573.34373 548.67773 569.80664 C 565.42985 566.53159 581.80741 560.42076 596.34375 551.54688 C 604.12261 548.7962 607.90912 541.0655 614.07031 536.17188 C 621.0295 540.12212 623.24425 548.24526 626.58789 554.91602 C 630.46598 564.29288 642.05297 567.18667 650.98828 563.55273 C 680.55169 552.01264 699.34984 524.70889 718.78711 501.14258 C 728.6584 491.16066 735.79261 476.76018 750.08203 472.40039 C 750.97659 472.33773 751.87531 472.31544 752.77539 472.32617 z M 1045.2754 532.97656 L 1045.2754 1045.2754 L 900.18164 1045.2754 L 802.49609 719.51562 L 1012.5742 651.24023 C 999.80879 608.59146 997.07945 567.31239 1045.2754 532.97656 z M 17.716797 542.33398 L 114.75195 542.70508 L 152.63281 617.34961 C 189.27885 647.79706 237.37608 665.91154 286.69531 682.71094 C 292.14005 714.9232 428.71369 788.94353 542.56836 742.87305 C 591.51067 756.03199 642.26434 764.9871 696.12891 748.25781 L 726.21094 799.13477 C 718.84547 803.28171 701.23294 800.59869 704.11328 811.57617 L 759.81836 892.34766 L 772.25977 972.93555 L 713.76953 980.91992 L 778.01562 1045.2754 L 17.716797 1045.2754 L 17.716797 542.33398 z M 781.63086 722.80469 C 789.20214 748.53357 796.77329 774.2611 804.34375 799.99023 C 829.93631 884.53827 849.79289 961.27955 877.1543 1045.2734 L 813.51758 1044.748 C 793.98643 1025.4471 778.65187 1015.0806 759.12109 995.7793 C 771.74184 994.11621 784.36194 992.44824 796.98242 990.7832 L 779.80078 884.43359 C 765.32571 862.59826 749.75207 841.51665 735.26562 819.68945 C 743.80912 818.39995 752.3515 817.10309 760.89453 815.81055 C 746.16558 790.7629 731.43491 765.71625 716.70703 740.66797 C 737.71719 734.8888 758.7265 729.10654 779.73633 723.32617 L 780.66602 723.06836 L 781.63086 722.80469 z"}
  //   ],

  //   // FWR_02 ---- 8
  //   [
  //     {id:4, name:"1_9AR_frame01_development.svg", d:"M 0 0 L 0 1062.9922 L 1062.9922 1062.9922 L 1062.9922 0 L 0 0 z M 17.716797 17.716797 L 157.97852 17.716797 C 140.82097 23.663897 127.77639 30.982491 114.28125 38.150391 C 89.470726 58.692491 76.022285 82.692073 80.333984 112.09766 C 82.831403 123.59016 83.477231 133.97078 79.662109 141.67578 C 80.483379 150.73258 83.695081 158.59513 92.097656 163.86133 C 73.698933 220.17273 86.627088 286.92488 129.07227 363.51758 C 85.163605 361.15938 101.81739 383.57794 111.59375 403.18164 C 169.30987 429.08744 225.3161 515.86387 315.63281 447.88867 C 330.09422 461.07117 345.23299 472.21868 362.2168 477.83398 C 431.0775 604.31218 470.24651 738.24685 433.51953 845.28125 C 392.70583 851.08265 416.55911 899.99635 409.75195 928.46875 L 363.64453 1045.2754 L 320.38672 1045.2754 C 308.78171 1023.9427 302.94785 1000.3022 297.57031 976.47852 C 312.31905 951.27062 311.49678 926.73933 297.09375 902.79883 C 333.22353 880.85503 397.55309 859.22577 370.29883 798.69727 C 434.26471 730.17587 366.82615 639.51865 297.09375 624.71875 C 258.67243 591.19465 237.16423 554.44908 225.31641 515.86328 C 198.63169 499.71388 169.89907 498.91686 140.70312 501.60156 C 106.52893 513.19166 91.466955 533.46916 85.087891 557.69336 C 86.863486 568.53166 81.229531 576.90037 75.580078 585.26367 C 73.488861 593.57537 72.732017 601.85902 79.382812 609.98242 C 40.555912 665.01992 29.162086 730.03256 46.109375 805.35156 C 36.645201 803.08886 27.180971 794.78893 17.716797 802.83203 L 17.716797 17.716797 z M 202.72461 17.716797 L 749.97656 17.716797 L 748.92578 98.736328 C 730.17265 100.71523 714.69748 108.70452 701.88477 121.57422 C 693.73638 131.17992 686.01979 137.343 678.86133 139.0293 C 672.1804 145.2206 669.21064 153.26593 668.46289 162.42383 C 593.87509 187.59813 567.90779 250.21896 537.4375 310.97266 C 530.43035 300.52906 523.08313 293.83437 515.08789 294.25977 C 504.31728 299.22827 500.13416 309.84285 496.14844 320.62695 C 495.86095 406.81755 498.17148 491.01868 588.99023 507.42578 C 586.62662 525.99418 588.75352 544.56246 595.30273 563.13086 C 564.6847 592.78646 555.21109 634.88043 540.33984 673.79883 L 518.42969 669.3418 C 515.53924 641.8822 530.30687 605.59417 495.0332 594.32617 C 476.41278 542.44407 450.95453 491.92977 427.81641 440.95117 C 431.71893 401.48927 417.87802 384.69872 404.41992 367.41992 C 418.56381 343.62602 481.62695 306.44784 434.12891 244.86914 C 474.49279 163.39284 378.56595 92.308794 303.03711 102.63477 C 249.99804 80.976495 212.44004 55.029297 202.72461 17.716797 z M 1045.2754 17.716797 L 1045.2754 748.40039 L 1045.2754 749.45117 L 1045.5371 797.50781 C 1045.4452 797.38571 1045.3664 797.28456 1045.2754 797.16406 L 1045.2754 905.17188 C 1034.9104 896.38698 1025.8604 883.65403 1013.623 880.48633 C 1021.4555 849.38013 1028.2111 813.71556 1029.2578 778.56836 C 1027.77 776.81966 1031.6731 777.43516 1026.5449 747.00586 L 1005.3613 695.88086 C 1012.0955 689.08606 1012.3212 679.68848 1012.1875 670.14648 C 1004.5647 661.84668 1006.5389 651.9488 1006.9355 642.3125 C 1004.338 608.6716 985.6195 591.15205 960.71875 579.81445 C 928.46742 568.49205 900.36764 569.62056 875.11328 579.28906 C 857.13928 623.88106 822.84147 649.42885 788.45508 674.87305 C 679.43137 694.29575 644.21032 773.19939 687.09375 835.05859 C 652.72695 889.25389 704.99682 917.77916 742.76367 950.60156 C 723.40311 970.45106 718.709 994.30198 730.1582 1022.5527 L 720.70508 1045.2754 L 661.77734 1045.2754 L 656.74609 1045.2754 L 554.60547 1045.2754 L 567.20898 922.76562 L 608.17383 857.11523 L 578.76367 851.33984 C 596.277 774.02194 610.75963 695.69397 640.21094 622.35547 C 646.1627 609.57527 654.61162 599.29078 663.32031 589.26758 C 684.90582 581.28178 696.06893 558.53173 700.87109 526.76953 C 740.54008 524.50723 804.28321 544.19076 817.72656 476.35156 C 878.96672 462.42896 921.97973 384.04773 845.5625 288.33203 C 835.39134 243.55603 830.32848 199.73641 842.41016 159.13281 C 827.54563 139.11581 819.36043 119.96151 772.23633 102.63281 L 772.76172 18.224609 L 1045.2754 17.716797 z M 158.4668 44.40625 C 162.66122 44.300627 167.02239 44.625669 171.53516 45.292969 C 163.79469 72.692369 146.76686 98.668504 161.13477 129.80078 C 139.36235 123.40558 122.56277 106.52193 99.849609 110.54883 C 103.23798 91.173881 99.815533 71.70975 125.69531 59.28125 C 134.80853 48.905825 145.88351 44.72312 158.4668 44.40625 z M 193.49414 50.419922 C 208.78086 86.049822 251.92142 102.23511 291.625 120.82031 C 293.65731 141.42681 289.79043 150.02824 297.83789 167.15234 L 183.25195 130.53516 C 166.32222 95.696076 187.86653 75.077922 193.49414 50.419922 z M 751.10547 119.79883 C 756.6572 119.78854 762.83719 121.19322 770.01953 124.73047 C 788.1652 125.81307 799.99163 136.2377 809.07812 151.8457 C 783.21471 162.3622 752.71446 164.81817 737.62305 194.73047 C 729.1073 173.99007 731.73036 150.7822 714.61328 135.5957 C 726.83337 129.0885 736.9177 119.82511 751.10547 119.79883 z M 316.70703 121.06055 C 389.83243 138.10515 429.90666 167.31809 420.02344 227.49609 L 418.20312 227.69141 C 408.77623 200.37531 387.40298 177.56628 347.78711 161.64258 C 334.5589 150.63398 320.75794 140.12805 316.70703 121.06055 z M 110.86133 134.91016 C 124.29451 134.64118 148.27953 151.11116 156.92383 156.95703 C 188.7063 206.17383 240.18261 230.62936 293.56055 222.66406 C 303.76313 223.08556 312.20384 226.77895 320.81445 230.15625 C 346.59993 287.84035 375.36669 346.96123 346.75781 378.42773 C 217.63904 351.23853 165.01139 219.20011 105.82617 136.12891 C 107.23908 135.32741 108.9423 134.94858 110.86133 134.91016 z M 181.8418 154.21094 C 227.55305 169.25754 261.56806 179.87264 302.90625 197.80664 C 241.26417 207.33794 213.47134 192.14064 181.8418 154.21094 z M 698.61719 155.6543 C 710.52783 160.5543 713.16744 196.14839 714.12305 207.83789 C 695.86197 262.15859 708.81315 316.82322 747.88672 353.41602 C 753.85912 361.58242 756.2263 370.35456 758.94141 379.06836 C 730.46278 433.84336 702.71859 491.79713 660.8457 488.58203 C 602.08101 372.05653 671.21457 251.6371 698.61719 155.6543 z M 319.82422 165.54102 C 332.82045 206.38272 349.03091 208.75166 364.12891 219.38086 C 423.86509 255.09526 428.72241 272.06803 430.13672 287.86523 C 414.93573 329.09857 391.15576 350.44062 367.42383 371.89453 C 392.25686 348.14428 375.73449 293.55857 339.95703 224.61719 C 326.34514 199.91769 316.44214 183.93822 319.82422 165.54102 z M 818.68555 171.96484 C 800.69993 205.30134 814.86905 248.51602 825.07031 290.51172 C 810.46619 304.51152 801.45982 306.69847 793.24805 323.26367 L 750.70898 212.32422 C 767.07194 178.19032 796.23588 182.46704 818.68555 171.96484 z M 109.99609 182.9668 L 126.4043 237.9043 C 136.87552 273.3101 152.20893 337.80905 179.61914 372.53125 L 150.93359 355.48438 C 120.48297 315.00158 94.364819 223.4076 109.99609 182.9668 z M 665.14453 187.125 L 632.99414 232.97266 C 612.20896 262.43956 572.03323 313.2171 562.22852 355.4082 L 557.64453 322.88477 C 570.00608 274.86267 624.37464 199.3847 665.14453 187.125 z M 731.61719 225.50586 C 748.24951 270.02706 761.07392 302.80508 772.78516 345.67578 C 727.40595 303.61818 721.9481 272.90296 731.61719 225.50586 z M 161.86914 273.45117 C 203.15183 334.33967 247.19335 384.34306 331.13281 399.66016 C 323.98641 406.02206 316.09012 409.74679 307.96094 412.65039 C 267.62094 414.12539 231.44154 410.75735 215.41211 383.93555 C 185.92605 350.84875 173.986 312.12127 161.86914 273.45117 z M 627.52539 281.9082 C 606.1452 350.6334 594.84362 414.93507 634.86133 489.26562 C 625.55471 487.55924 617.81612 483.68065 610.56445 479.12695 C 584.53239 448.73215 564.79621 418.64312 575.54492 390.04102 C 582.80989 347.22612 605.24366 314.6194 627.52539 281.9082 z M 840.36523 310.10938 C 872.37921 377.09517 874.63054 425.78524 822.21875 454.40234 L 820.94531 453.10742 C 836.14932 429.32772 840.51173 399.00279 828.31641 358.67969 C 828.62428 341.78399 828.19131 324.74677 840.36523 310.10938 z M 519.90625 316.25 C 538.83225 346.3427 527.96938 401.11819 548.96875 434.33789 C 555.17385 440.56749 559.95879 447.78692 566.36719 454.32422 C 567.70208 461.06352 573.76125 471.63217 580.1582 486.25977 C 522.0064 466.42867 508.49561 374.69 519.90625 316.25 z M 808.05859 339.34375 C 784.64839 374.04625 792.82875 388.04501 793.9668 406.16211 C 803.34932 474.02061 793.28444 488.02158 782 498.64258 C 740.9048 511.70784 709.81489 506.14296 678.67188 500.67578 C 712.25973 505.56812 744.05602 459.85456 775.01758 390.57422 C 785.62498 365.12662 791.813 347.81275 808.05859 339.34375 z M 122.18164 381.46289 C 157.85999 385.48309 194.60838 429.06938 234.06055 433.42188 C 242.86963 432.42347 251.57985 433.19166 260.75977 432.22656 C 266.94328 435.45096 279.10826 437.33385 294.70703 441.53125 C 242.77112 475.44325 161.49857 427.82059 122.18164 381.46289 z M 385.3418 383.93945 C 402.37755 393.05895 410.18651 413.68369 408.53711 432.24219 C 407.02779 437.98069 408.55029 443.53696 410.3457 449.06836 C 428.68102 508.47266 461.4735 562.37297 478.43555 622.29297 C 482.7548 622.06067 486.96792 620.78829 490.90039 619.05859 C 496.07918 617.63789 496.12554 624.79003 495.1543 628.05273 C 496.48789 646.32673 490.78079 665.13723 497.00391 682.92773 C 510.30881 725.20313 502.2462 770.10595 494.63281 812.62305 C 497.53636 817.10385 504.0775 815.89293 508.60156 817.17383 C 502.00027 829.54173 494.49394 841.39132 487.50977 853.54102 C 470.50504 919.76812 447.89774 984.50999 420.80859 1047.2754 L 389.70898 1047.2754 C 404.13575 1009.0841 417.94094 970.65992 432.62695 932.57422 C 439.0096 912.17022 432.65867 890.69978 434.74805 869.76758 C 440.05997 868.67368 444.52472 872.41724 449.53125 873.14844 C 468.36898 817.32444 480.15305 757.29232 471.17773 698.38672 C 468.01517 671.60402 455.78909 647.32706 448.28516 621.72266 C 432.13278 575.36556 411.47797 530.61087 389.70312 486.60547 C 384.1343 478.18197 382.34239 467.31546 374.66797 460.38086 C 357.69337 453.07656 337.78385 445.8762 329.21484 428.0332 C 339.29893 424.6088 348.59223 419.15051 356.80664 412.50781 C 367.18158 404.56681 375.18384 394.22037 384.24609 384.95312 L 384.60742 384.61719 L 385.3418 383.93945 z M 612.86523 507.57422 C 626.29148 517.32352 649.34757 522.00265 678.80078 523.31445 C 680.22893 542.16915 672.65197 558.36759 650.95898 570.40039 C 630.836 586.53959 633.19635 590.92957 616.6543 614.76367 L 616.37109 614.66016 C 587.00869 698.18226 565.26041 783.98964 550.72852 871.96094 L 569.30859 874.97266 L 544.27148 914.61523 C 538.34116 957.66703 534.08628 1001.2221 531.49414 1045.2754 L 502.08789 1045.2754 C 504.39866 1028.3942 506.54309 1011.4522 508.63672 994.49023 L 490.06836 942.9082 L 514.60156 945.51953 C 522.32479 881.80133 530.41994 818.22121 543.69922 756.57031 L 532.42188 696.5918 L 557.10742 701.84375 L 557.06836 702.01172 C 566.30324 668.86072 577.53921 636.4555 591.58789 605.0957 L 591.82227 605.18359 C 600.57426 582.58199 608.22526 571.06638 617.13281 548.92578 C 611.74401 530.92658 608.46762 515.70282 612.86523 507.57422 z M 166.36914 519.48828 C 175.23568 519.60928 184.07289 522.54488 193.0332 527.33203 C 176.54624 549.86413 151.87812 567.97262 154.74414 601.35352 C 136.6051 588.17552 126.65134 567.04768 104.10938 563.11328 C 113.8234 546.47998 117.21757 527.47588 145.55469 524.76758 C 152.55931 521.00153 159.47294 519.39417 166.36914 519.48828 z M 211.77344 539.4082 C 213.97473 577.223 248.72704 606.55835 279.46289 636.93945 C 274.38696 656.52285 267.87282 663.11394 269.58398 681.52344 L 175.12109 609.45312 C 171.12016 571.81192 198.18409 560.1353 211.77344 539.4082 z M 102.24414 588.47656 C 115.03355 588.28521 134.89601 615.69694 141.63086 624.84766 C 154.61788 680.66476 194.34557 720.38331 246.81445 731.00391 C 256.18564 734.81701 262.80856 741.0396 269.69531 747.0293 C 274.22576 808.5988 281.05089 872.48819 243.72852 891.74219 C 132.52478 823.43989 128.1163 684.65443 101.0293 588.58203 C 101.42646 588.51687 101.83158 588.48274 102.24414 588.47656 z M 927.82617 592.14648 C 936.78463 592.26962 945.31963 594.95896 953.42578 601.19141 C 980.95402 608.43861 981.23521 627.73936 988.13672 645.72266 C 965.25517 645.96656 952.02067 665.21021 931.99219 675.28711 C 940.20937 642.80681 918.78956 620.95464 906.15625 596.05664 C 913.63505 593.50715 920.85848 592.05071 927.82617 592.14648 z M 885.71094 604.94922 C 895.77601 627.59822 920.60112 643.49059 910.57617 679.99219 L 805.7168 735.86719 C 810.37741 717.97539 805.01202 710.41934 803.16406 690.27344 C 838.40126 665.25264 877.43399 641.91262 885.71094 604.94922 z M 165.79688 630.69727 C 203.33191 659.85017 231.45905 681.0091 263.93945 711.3418 C 203.23456 699.3822 182.45963 676.11007 165.79688 630.69727 z M 89.074219 632.94336 L 85.789062 688.8457 C 83.575784 724.8377 76.053808 789.14737 89.867188 830.20117 L 68.884766 804.93164 C 54.185031 757.57294 60.817296 664.78726 89.074219 632.94336 z M 302.77148 645.58398 C 365.19393 685.77648 392.68127 726.0302 363.10742 777.9082 L 361.3418 777.47461 C 361.79222 749.25341 349.5798 721.15454 318.02539 693.24414 C 309.41437 678.70414 300.09849 664.43378 302.77148 645.58398 z M 984.62891 670.91602 C 985.48698 670.95559 986.30158 671.09862 987.06445 671.35547 C 944.82349 761.79507 918.0702 898.04735 797.29883 947.50195 C 763.5742 922.47545 780.62285 860.52669 795.0332 800.49609 C 802.79654 795.69679 810.33539 790.6252 820.19922 788.375 C 873.69441 786.3639 919.31327 753.57824 941.14062 700.58984 C 949.0023 692.90262 971.75779 670.32242 984.62891 670.91602 z M 290.63086 687.42773 C 288.93318 729.25373 303.24757 736.87141 313.73047 751.69141 C 357.35177 804.51171 356.13857 821.71303 352.11328 836.67773 C 323.99872 869.38241 294.61428 880.97161 265.23633 892.67578 C 296.40114 879.21 299.45456 823.60707 289.41797 748.37891 C 285.08073 721.15241 281.25343 703.16643 290.63086 687.42773 z M 778.76562 695.04102 C 778.36059 714.07512 766.86482 726.65603 756.01953 739.61523 C 720.37335 762.06563 703.78317 787.82435 699.67188 815.74805 L 697.86133 815.89062 C 677.05015 759.91895 710.67355 724.62932 778.76562 695.04102 z M 916.34766 702.46094 C 892.57234 744.58814 868.31199 764.20403 806.47266 766.20703 C 843.42371 741.51563 874.59872 725.17214 916.34766 702.46094 z M 991.70312 717.06445 C 1014.4488 753.05215 1006.0135 845.69019 983.86133 890.05469 L 959.07422 911.60547 C 979.33383 873.32017 982.29392 808.64087 985.91992 772.76367 L 991.70312 717.06445 z M 106.83398 733.35938 C 124.73135 803.07268 148.88375 863.72905 221.97461 905.96875 C 213.15849 909.40405 204.53528 910.16846 195.97266 910.10156 C 157.85711 897.90656 125.26029 882.66684 119.38672 852.68164 C 103.08438 812.43074 105.05092 772.89817 106.83398 733.35938 z M 783.99219 738.29688 C 790.70588 755.34298 784.0252 772.47328 775.34961 798.64258 C 753.30359 871.25331 747.34004 926.61705 775.9082 944.94531 C 748.80902 928.65454 721.68556 912.47097 699.22266 875.66211 C 697.66596 860.24381 699.24625 843.07388 750.82227 797.98828 C 763.56011 785.05498 778.91553 779.84837 783.99219 738.29688 z M 957.96289 813.29688 C 953.33972 852.60496 948.90076 891.93604 926.31445 929.02734 C 915.67734 957.67104 881.04716 967.44818 841.46289 973.33008 C 833.00179 972.01378 824.61662 969.86809 816.4707 965.05469 C 895.42173 935.16819 929.04627 879.20667 957.96289 813.29688 z M 33.287109 819.10352 C 65.196751 834.77322 84.717064 887.09208 120.0332 904.33398 C 128.58531 906.37668 136.44927 910.00728 145.33594 912.20508 C 150.01121 917.23928 160.71804 923.05197 173.84375 932.14062 C 113.94191 945.80354 54.267158 874.82852 33.287109 819.10352 z M 17.716797 838.46094 C 61.646742 903.38834 99.952035 979.96778 192.26367 944.67578 C 201.31366 964.02648 212.79387 979.3275 227.2207 989.7168 C 237.45871 1007.7496 248.73828 1025.522 252.09375 1045.2754 L 17.716797 1045.2754 L 17.716797 838.46094 z M 1016.7051 909.78906 C 987.00425 961.39626 916.65467 1021.8061 859.74414 998.65234 C 874.16491 991.80184 885.67104 987.79358 891.09766 983.58008 C 900.22256 982.84578 908.56625 980.53384 917.33594 979.89844 C 954.97239 968.58384 982.68425 920.10196 1016.7051 909.78906 z M 277.25 911.86914 C 288.76773 927.71564 290.56656 946.20941 276.91992 968.91211 C 276.69043 969.14389 276.46154 969.33921 276.23242 969.56055 C 277.9797 993.52062 282.05028 1018.1227 298.65039 1046.1855 L 276.13281 1046.1855 C 267.01568 1022.3453 256.31217 998.64001 243.63867 975.10156 C 224.86752 958.86174 213.52779 944.57525 212.87305 933.09961 C 229.41876 934.34521 251.49634 926.22044 277.25 911.86914 z M 1042.7695 930.41797 C 1044.0112 930.37964 1044.7325 930.70338 1045.1133 931.1875 C 1045.1599 931.07009 1045.1796 930.99556 1045.2305 930.87109 L 1045.2305 931.37891 C 1045.5948 932.01385 1045.4888 932.84001 1045.2324 933.51758 L 1045.2754 1045.2754 L 1027.5586 1045.2754 L 1027.0176 1045.2754 L 799.06445 1045.2754 C 813.9613 1036.197 828.44418 1026.4281 838.05469 1008.5391 C 903.45257 1055.0228 969.02993 1005.7136 1030.8945 939.17188 L 1035.6992 932.48047 C 1039.0212 931.0343 1041.273 930.46416 1042.7695 930.41797 z M 1045.2324 933.51758 L 1045.2305 931.37891 C 1045.1933 931.31422 1045.1606 931.2476 1045.1133 931.1875 C 1043.3019 935.75227 1044.6417 935.0787 1045.2324 933.51758 z M 760.9668 961.95508 C 784.0659 980.27568 804.54248 991.85713 821.07227 993.29883 C 818.57358 1004.5182 805.07605 1016.7868 783.92969 1029.7832 C 779.97708 1034.9184 776.14713 1040.0849 772.41406 1045.2754 L 744.86914 1045.2754 C 748.15239 1036.4592 750.5737 1027.7355 752.6543 1019.0488 C 752.46498 1018.7948 752.27199 1018.567 752.08398 1018.3027 C 742.28127 993.69507 747.042 975.73438 760.9668 961.95508 z M 474.60742 972.91016 C 479.00072 982.56776 485.07752 991.80573 482.67383 1003.1621 L 476.62305 1045.9473 L 447.04492 1045.9473 L 474.60742 972.91016 z"}
  //   ],

  //   // FWR_03
  //   [
  //     {id:4, name:"1_9AR_frame01_development.svg", d:"M 0 0 L 0 1062.9922 L 1062.9922 1062.9922 L 1062.9922 0 L 0 0 z M 597.47852 17.654297 C 411.07501 66.673326 337.66299 168.04588 341.04102 249.92773 C 341.4541 298.00411 365.82398 354.5987 414.16016 408.62695 C 446.74244 466.06839 482.63099 525.52182 512.58984 580.33984 C 512.19516 598.4813 514.21111 615.41614 519.41602 630.75781 C 563.39023 774.50474 567.80599 906.99353 576.66211 1045.3379 L 395.91406 1044.7754 C 379.88668 978.9797 364.9292 869.94179 350.62109 843.00195 C 341.32249 806.35865 339.73491 798.56738 336.37891 770.54883 C 340.35814 715.55355 347.05116 661.95695 360.80859 609.75 C 354.40897 607.62685 404.54108 551.86554 359.23242 451.66602 C 352.51221 426.25483 342.41131 401.69008 313.54102 381.81641 C 264.68785 360.41455 261.57034 327.34017 253.14258 295.1582 C 144.1795 328.36628 38.170945 413.5609 17.654297 508.91211 L 17.654297 509.96289 L 17.128906 18.177734 L 597.47852 17.654297 z M 626.86914 18.177734 L 1044.2891 18.703125 L 1045.7363 538.38672 C 1008.538 468.95834 1020.019 491.85849 988.23828 453.2207 C 945.85325 401.69049 845.12109 346.65382 804.38281 338.82422 C 797.5636 376.94895 787.76372 414.22749 750.16406 424.23828 C 722.99203 445.22658 707.03194 473.32087 699.6582 508.16797 C 670.45889 585.00436 690.97968 614.37947 703.37109 651.51562 C 719.03016 712.57458 733.81408 773.19714 734.56641 826.80273 C 735.18327 838.37313 728.48635 862.94234 719.65234 893.05469 C 723.43298 947.24168 711.4298 999.01936 699.6582 1045.3809 L 647.44922 1045.3379 C 643.68646 884.31691 638.44655 728.16773 620.92773 561.64453 C 612.70754 523.59851 634.91371 434.76275 675.14648 338.08203 C 703.3682 301.1037 720.93951 255.98052 701.88477 182.84961 C 701.79017 151.28433 688.0937 127.49157 668.46289 107.08984 C 640.14656 87.570112 621.70603 65.597065 626.86914 18.177734 z M 607.19922 33.408203 C 607.13342 44.848992 608.69153 56.332317 612.16016 67.248047 C 617.63209 86.048777 630.14477 101.94162 645.55859 113.71094 C 667.54863 128.67231 679.87063 154.6791 681.91211 180.74609 C 672.57539 209.23554 662.46825 237.73587 645.85547 262.98438 C 629.49992 290.8347 600.24329 310.05867 568.42773 314.80078 C 568.88888 276.05096 571.00113 236.89382 564.19727 198.51172 C 562.0763 179.71197 547.88278 160.35706 527.81836 159.24414 C 508.20562 158.53994 492.68725 175.30899 486.74023 192.6582 C 475.9702 234.43896 478.80897 278.09272 477.4082 320.78906 C 476.10108 325.52476 479.34471 331.87159 475.14844 335.53516 C 468.53382 337.43321 463.4453 342.63747 456.86719 344.56641 C 435.27623 331.4114 414.0973 316.80638 395.39453 299.57812 C 379.6297 284.09812 362.20432 266.33276 359.69531 243.39062 C 359.17782 206.06481 379.08072 171.22836 403.45312 144.0332 C 456.49093 87.333196 528.6531 49.389018 604.49805 33.941406 L 607.19922 33.408203 z M 525.55469 180.77344 C 525.8631 180.77151 526.17742 180.78214 526.49609 180.80469 C 529.61826 181.25319 532.50363 183.08332 534.27539 185.6875 C 548.01426 228.25727 541.79085 273.85902 543.16797 317.9043 C 535.39309 319.482 527.50738 320.92034 519.67188 322.36914 C 513.77873 322.8719 508.13613 324.76608 502.38477 325.6875 C 505.60178 283.92925 500.63251 241.50344 509.91797 200.49219 C 511.33546 192.40931 515.99382 180.83319 525.55469 180.77344 z M 686.6582 227.07031 C 691.36037 259.63487 679.08604 291.3619 663.29102 319.25781 C 637.33609 370.05966 615.48931 423.48736 603.53125 479.43359 C 598.25928 467.31527 591.90141 455.64397 584.25391 444.85547 C 557.1688 405.95583 513.83397 383.73274 474.05469 360.2832 C 510.735 346.61695 550.14187 343.4033 587.99219 334.04492 C 601.38689 327.36788 615.03304 320.48066 628.04492 312.77344 C 658.38825 294.53544 674.98135 261.11679 686.07812 228.76172 L 686.33398 228.01562 L 686.6582 227.07031 z M 367.49414 309.80469 C 393.01637 327.26598 440.57853 365.55772 461.57422 377.87695 C 482.56991 390.19619 500.88673 401.49122 517.91406 412.98242 C 544.73349 432.38864 573.4336 459.83043 581.25781 493.18359 C 594.00679 525.22702 597.08464 564.55488 576.48438 593.96875 C 571.23746 603.76574 557.33079 600.32519 550.92578 593.57227 C 509.31238 532.36657 475.0982 466.43899 437.91992 402.47852 C 420.37261 380.8933 402.34677 360.31427 389.99219 337.99414 L 375.95117 316.96289 L 367.49414 309.80469 z M 240.95898 319.70508 C 242.87876 330.98384 246.40529 342.0233 251.71484 352.17188 C 260.36509 369.73838 275.4443 383.21959 292.66602 392.13672 C 316.91797 403.05677 333.56541 426.53193 340.09766 451.84961 C 335.84442 481.52676 330.83275 511.34823 318.85156 539.0957 C 307.57503 569.36094 282.09854 593.36947 251.58789 603.55859 C 245.3203 565.31622 240.60673 526.38366 227.24805 489.76367 C 221.89813 471.61684 204.56266 455.01987 184.60938 457.4043 C 165.17181 460.11291 152.79855 479.31971 149.95117 497.4375 C 146.59193 540.45309 156.95953 582.95209 162.98633 625.24414 C 162.52051 630.13478 166.81551 635.82226 163.31836 640.1582 C 157.13326 643.17488 153.02464 649.18384 146.88086 652.22461 C 123.33528 643.01432 99.944842 632.30478 78.537109 618.58203 C 60.32602 606.07135 40.083455 591.5966 33.632812 569.4375 C 26.648435 532.76731 40.206671 495.00674 59.492188 463.99609 C 101.89044 398.95541 166.37511 349.06912 238.39062 320.69922 L 240.95898 319.70508 z M 817.9375 365.96094 L 820.52734 366.89453 C 893.19639 393.54585 958.84819 441.88514 1002.7793 505.90039 C 1022.796 536.44421 1037.248 573.87153 1031.1367 610.69727 C 1025.2142 633.00333 1005.3209 647.95482 987.41211 660.89453 C 966.33637 675.12191 943.20689 686.38537 919.88672 696.15234 C 913.67244 693.25836 909.42299 687.34745 903.16797 684.47852 C 899.56882 680.22688 903.72638 674.44069 903.14453 669.5625 C 908.16507 627.13923 917.52067 584.40413 913.14062 541.48047 C 909.8637 523.43542 897.03744 504.52935 877.54102 502.2832 C 857.53672 500.37339 840.60096 517.37965 835.68359 535.64844 C 823.1985 572.5754 819.41019 611.60588 814.05273 649.98633 C 783.30868 640.5248 757.26957 617.1295 745.27734 587.14062 C 732.64045 559.68557 726.9218 529.99159 721.96484 500.42383 C 727.89389 474.95814 743.97912 451.09458 767.96484 439.60156 C 784.96989 430.27788 799.72453 416.44086 807.95508 398.67383 C 813.02208 388.40202 816.28616 377.28212 817.9375 365.96094 z M 187.04688 478.86523 C 190.19951 478.76534 193.36001 480.06881 195.55664 482.32617 C 216.47161 521.86736 218.25148 567.85742 227.24805 610.99609 C 219.86472 613.89855 212.34821 616.68273 204.88281 619.46875 C 199.16621 620.98615 193.93792 623.82926 188.43359 625.73438 C 184.35821 584.05115 172.10606 543.13108 174.13672 501.13086 C 174.13043 492.65991 176.87876 479.92361 187.04688 478.86523 z M 352.80664 496.64844 C 363.08635 527.90365 356.50175 561.27929 345.78516 591.49219 C 329.03607 646.02616 316.78884 702.43307 314.7168 759.60547 C 307.42264 748.58537 299.13734 738.19485 289.73438 728.89648 C 256.31214 695.28489 209.77906 680.91441 166.53516 664.7207 C 200.28877 644.89886 238.54216 634.89746 274.19531 619.11523 C 286.22871 610.2159 298.47154 601.06819 309.94922 591.2207 C 336.66888 567.99567 347.21323 532.20549 352.5293 498.41602 L 352.65234 497.63477 L 352.80664 496.64844 z M 875.61328 523.79688 C 885.80365 524.61343 888.85585 537.28129 889.05078 545.75 C 892.07848 587.69014 880.80093 628.88798 877.7168 670.65625 C 872.16877 668.88242 866.87408 666.16439 861.12305 664.7832 C 853.59359 662.17529 846.0127 659.57197 838.5625 656.8457 C 846.53187 613.5055 847.2196 567.4858 867.18945 527.45898 C 869.33184 525.15008 872.45915 523.7719 875.61328 523.79688 z M 710.32422 545.51172 L 710.50195 546.49414 L 710.64258 547.27148 C 716.75975 580.92514 728.15223 616.45525 755.41602 639.03906 C 767.12437 648.61115 779.58089 657.46713 791.82227 666.07812 C 827.84024 681.00905 866.32025 690.09683 900.53516 709.11133 C 857.6881 726.32763 811.50898 741.79934 778.89453 776.19531 C 769.71506 785.7144 761.67878 796.29803 754.64844 807.48828 C 751.21898 750.38122 737.63539 694.28285 719.5957 640.16211 C 708.16449 610.21228 700.7898 577.00228 710.32422 545.51172 z M 604.69727 595.20117 C 614.98028 739.69448 623.8623 899.96945 626.75586 1044.8125 C 616.73372 1044.6973 606.54362 1045.088 596.52148 1044.9727 C 596.26502 1040.4774 595.98898 1028.7691 595.60742 1024.2832 C 590.39707 888.7916 574.58775 741.10025 536.05859 610.66016 C 541.21399 614.00857 547.45635 620.30343 554.06055 621.56836 C 574.41375 626.35134 594.29577 612.72505 604.3418 595.79297 L 604.69727 595.20117 z M 17.716797 609.67578 C 31.194239 626.812 57.849651 682.11056 115.86719 722.44727 C 146.87126 759.25731 206.53877 825.48077 228.13867 858.57812 C 241.79849 879.50896 240.55494 889.82969 249.63867 907.60938 C 276.27619 959.74724 290.68382 997.09343 303.77734 1045.584 L 17.716797 1045.2754 L 17.716797 609.67578 z M 52.833984 633.49219 C 80.998236 646.26155 134.48056 675.72245 157.29492 684.21289 C 180.10927 692.70334 200.10857 700.64838 218.87109 709.01172 C 248.65025 723.4715 281.6748 745.52142 295.16602 777.01172 C 313.28015 806.35786 323.13302 844.5543 307.94727 877.0957 C 304.47935 887.65432 290.18829 886.67817 282.70898 881.13867 C 231.10937 828.07934 185.97717 769.08465 138.26758 712.54297 C 117.242 694.32883 95.919914 677.19022 79.880859 657.35156 L 62.404297 639.07422 L 52.833984 633.49219 z M 1045.3379 646.02539 L 1044.8145 1044.2891 L 770.30664 1044.8125 C 778.36422 1014.8162 793.25541 985.87449 805.12109 967.93164 C 816.00967 951.49898 822.06749 935.17093 825.08008 919.61328 C 866.83298 869.51996 908.58499 819.11228 950.33789 766.25781 C 1009.016 715.03953 1017.8165 700.56262 1045.3379 646.02539 z M 1013.4609 675.19141 L 1004.0273 680.99805 L 986.99023 699.68555 C 971.42692 719.89959 950.5167 737.5416 929.92969 756.25 C 883.57658 813.90897 839.8599 873.95852 789.53516 928.22852 C 782.18954 933.94411 767.92477 935.26038 764.20703 924.78711 C 748.25262 892.6156 757.19545 854.19391 774.60742 824.42578 C 787.34685 792.62392 819.83833 769.79781 849.26562 754.63477 C 867.82421 745.82814 887.63009 737.40886 910.23633 728.37891 C 932.84258 719.34896 985.60806 688.62615 1013.4609 675.19141 z M 336.24805 869.10156 C 345.94633 921.33226 358.33165 993.71894 371.34375 1045.2422 C 358.02929 1045.1088 344.0625 1045.6259 330.74805 1045.4902 C 317.68507 999.66071 293.45608 937.02104 268.12109 896.42773 C 273.81687 898.33076 282.60486 903.39836 291.60352 907.52734 C 306.97553 907.63875 313.02173 908.96222 320.06641 894.25195 L 336.24805 869.10156 z M 741.03125 936.50391 C 751.5163 951.30865 771.6361 957.85817 789.00586 953.22656 C 773.24727 976.85257 754.7115 1017.5951 747.95898 1045.3633 C 739.01218 1045.9848 732.42073 1044.7258 723.4707 1045.2363 C 731.46687 1014.6884 739.84115 968.4273 741.02148 936.80664 L 737.14648 943.30664 L 741.03125 936.50391 z"}
  //   ]


  //   // [
  //   //   {id:4, name:"1_9AR_frame04plain.svg", d:"M 0,0 V 1062.9922 H 772.44141 V 0 Z M 28.345703,28.347656 H 170.07812 V 116.92969 H 28.345703 Z m 170.080077,0 H 357.87305 V 116.92969 H 198.42578 Z m 187.79492,0 H 627.16602 V 116.92969 H 386.2207 Z m 269.29102,0 h 88.58203 V 116.92969 H 655.51172 Z M 447.85938,148.81836 H 627.16602 V 304.72461 H 572.57617 A 187.79527,187.79527 0 0 0 447.85938,148.81836 Z m -419.513677,0.002 H 324.58594 A 187.79527,187.79527 0 0 0 199.74219,304.72461 H 28.345703 Z m 627.166017,0 h 88.58203 v 155.9043 H 655.51172 Z M 386.2207,166.53516 A 159.44882,159.44882 0 0 1 545.66992,325.98438 159.44882,159.44882 0 0 1 386.2207,485.43359 159.44882,159.44882 0 0 1 226.77148,325.98438 159.44882,159.44882 0 0 1 386.2207,166.53516 Z M 28.345703,333.07031 H 198.67773 a 187.79527,187.79527 0 0 0 59.98438,130.41992 V 559.8418 A 187.79527,187.79527 0 0 0 95.138672,655.51172 H 28.345703 Z m 545.316407,0 h 53.50391 v 439.3711 H 444.60352 A 187.79527,187.79527 0 0 0 446.45703,747.63867 187.79527,187.79527 0 0 0 386.2207,610.13281 V 513.7793 A 187.79527,187.79527 0 0 0 573.66211,333.07031 Z m 81.84961,0.002 h 88.58203 v 322.43941 h -88.58203 z m -368.50391,152.0898 a 187.79527,187.79527 0 0 0 70.86524,26.22851 v 77.06836 a 187.79527,187.79527 0 0 0 -70.86524,-26.22656 z m -28.3457,103.02734 A 159.44882,159.44882 0 0 1 418.10938,747.63867 159.44882,159.44882 0 0 1 258.66211,907.08594 159.44882,159.44882 0 0 1 99.212891,747.63867 159.44882,159.44882 0 0 1 258.66211,588.18945 Z M 28.345703,683.85742 h 53.931641 a 187.79527,187.79527 0 0 0 -11.41211,63.78125 187.79527,187.79527 0 0 0 1.869141,24.80274 H 28.345703 Z m 627.166017,0.002 h 88.58203 v 88.58203 H 655.51172 Z M 28.345703,800.78711 H 78.677734 A 187.79527,187.79527 0 0 0 258.66211,935.43359 v 99.21291 H 28.345703 Z m 410.322267,0 h 188.49805 v 88.58203 H 386.2207 v -4.13476 a 187.79527,187.79527 0 0 0 52.44727,-84.44727 z m 216.84375,0 h 88.58203 v 88.58398 H 655.51172 Z M 357.87305,906.95508 V 1034.6465 H 287.00781 V 933.13477 a 187.79527,187.79527 0 0 0 70.86524,-26.17969 z m 28.34765,10.76172 h 240.94532 v 116.9297 H 386.2207 Z m 269.29102,0 h 88.58203 v 116.9297 h -88.58203 z"},
  //   //   {id:3, name:"1_9AR_frame03_development.svg", d:"M -3.1667353,25.248577 V 274.24851 H 214.8334 V 25.248577 Z m 7.9997875,7.999788 H 69.833462 V 73.248403 H 4.8330522 Z m 73.0001968,0 H 97.832995 V 73.248403 H 77.833249 Z m 28.000081,0 h 68.00013 v 40.000038 h -68.00013 z m 75.99991,0 h 24.99982 V 73.248403 H 181.83324 Z M 4.8330522,81.248743 H 28.729888 69.833462 V 106.24856 H 28.729888 4.8330522 Z m 73.0001968,0 H 97.832995 V 106.24856 H 77.833249 Z m 28.000081,0 h 24.99982 43.00031 v 24.999817 h -43.00031 -24.99982 z m 75.99991,0 h 24.99982 V 106.24856 H 181.83324 Z M 4.8330522,114.24835 H 28.729888 69.833462 V 266.24873 H 28.729888 4.8330522 Z m 73.0001968,0 H 97.832995 V 233.24857 H 77.833249 Z m 28.000081,0 h 24.99982 43.00031 v 119.00022 h -43.00031 -24.99982 z m 75.99991,0 h 24.99982 V 233.24857 H 181.83324 Z M 77.833249,241.24836 h 19.999746 v 25.00037 H 77.833249 Z m 103.999991,0 h 24.99982 v 25.00037 h -24.99982 z m -75.99991,5.6e-4 h 24.99982 43.00031 v 24.99981 h -43.00031 -24.99982 z"},
  //   //   {id:2, name:"1_9AR_frame02_development.svg", d:"M -3.1667353,6.166721 V 290.16661 H 214.8334 V 6.166721 Z m 7.9997875,7.999788 H 69.833462 V 282.16683 H 4.8330522 Z m 73.0001968,0 H 97.833545 V 282.16683 H 77.833249 Z m 28.000081,0 H 206.83306 V 282.16683 H 105.83333 Z"},
  //   //   {id:1, name:"1_9AR_frame01_development.svg", d:"M 0,0 V 690.94531 H 772.44141 V 0 Z M 28.345703,28.345703 H 258.66211 V 662.59766 H 28.345703 Z m 259.369137,0 h 70.15821 L 357.16602,421.6543 h -70.15821 z m 98.50586,0 H 744.09375 V 421.6543 H 386.2207 Z M 287.00781,450 H 744.09375 V 662.59766 H 287.00781 Z"}
  //   // ]
  // ];

  window:{d:string, priority:string}[] = [];

  // Method to check whether selected window shape is a 2xHung
  isDoubleHung():boolean {
    if(this.selectedWindowShape.substring(0, 2) == "2x") {return true;}
    return false;
  }
  
  
    

  constructor(private http:HttpClient) {
    // // Getting data and populating user info
    // const data = JSON.parse(localStorage.getItem('userInfo') || '{}');
    // this.userInfo = [];
    // for(let i:number = 0; i < data.length; ++i) {
    //   this.userInfo.push(data[i]);
    // }

    // // User is not signed in
    // if(this.userInfo.length <= 1) {this.signedIn = false;} 
    // // User is signed in
    // else {this.signedIn = true;}

    // // Getting panelsets from database
    // this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/panels").subscribe(result => {
    //   let panelData = JSON.parse(JSON.stringify(result));
      
    //   if(panelData.length > 1) {
    //     this.svgTemplateData = [];
    //     for(let i:number = 0; i < 50; ++i) {this.svgTemplateData.push([]);}
    //     for(let i:number = 0; i < panelData.length; ++i) {
    //       let tmp:{id:number, name:string, d:string} = {id:panelData[i][1], name:panelData[i][3], d:panelData[i][4]};
    //       this.svgTemplateData[panelData[i][1]].push(tmp);
    //     }
    //     // for(let i:number = 0; i < 50; ++i) {
    //     //   if(this.svgTemplateData[i] == []) {
    //     //     this.svgTemplateData = this.svgTemplateData.splice(i, 1);
    //     //     --i;
    //     //   }
    //     // }
    //   }
    //   else {alert("error");}
    // });
  }
}
