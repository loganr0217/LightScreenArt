import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { Polygon } from '../svgScaler';
import { SVGTemplate } from '../svgScaler';
import { Entry } from 'contentful';
import { ContentfulService } from 'src/app/services/contentful.service';

declare var $:any;

@Component({
  selector: 'app-design-window',
  templateUrl: './design-window.component.html',
  styleUrls: ['./design-window.component.css']
})
export class DesignWindowComponent implements OnInit {
  howToPosts:Entry<any>[] = [];
  constructor(public sharedDataService:SharedDataService, public contentfulService:ContentfulService) { }
  mouseX:number = 0;
  mouseY:number = 0;

  onMousemove(e:any) {
    let elem = document.querySelector("#designWindow");
    let rect = elem!.getBoundingClientRect();
    this.mouseX =(e.clientX - rect.left);
    this.mouseY = (e.clientY - rect.top);
  }

  // Queue-like array to hold changes
  recentChanges:string[][][];
  darkRecentChanges:string[][][];
  undoQueueSize:number = 10;
  ngOnInit(): void {
    this.contentfulService.getPostById('59SeNkOJ9iQ3KlfMaRb0WA', 'howTo').then(post => this.howToPosts.push(post));
    // let newTemplate:SVGTemplate = new SVGTemplate(String(document.getElementById("svgTemplate")?.getAttribute("d")));
    // document.getElementById("svgTemplate")?.setAttribute("d", newTemplate.getOptimizedD());
    // document.getElementById("svgTemplate")?.setAttribute("style", "fill:#666666");
    // let panes:Element = document.createElementNS("http://www.w3.org/2000/svg", "path");
    // panes.setAttribute("d", newTemplate.getPanesD());
    // panes.setAttribute("style", "fill:#0000ff")
    // panes.setAttribute("id", "svgPanes");
    // document.getElementById("currentTemplate")?.appendChild(panes);
    this.recentChanges = [];
    this.darkRecentChanges = [];
  }

  // Checking whether it is the color page (TDI)
  isColorPage():boolean {
    return document.URL.includes("windowCreation");
  }

  // Returns 0 to n-1 (mainly used for iterating svg path items)
  range(n:number=this.sharedDataService.maxPanes):number[] {
    return [...Array(n).keys()];
  }

  completeOrder():void {
    $('#customLightscreenModal').modal('show');
  }

  // Fills selected panel for a pane if autofill string exists
  autofillPanel(autofillString:string, baseAutofillString:string, panelNumber:number = 0, paneId:number):void {
    if(autofillString != undefined) {
      //alert(autofillString);
      let tmpHex:string = "";
      let splitAutofillString:string[] = autofillString.split(',');
      let baseSplitAutofillString:string[] = baseAutofillString.split(',');

      for(let i:number = 0; i < splitAutofillString.length; ++i) {
        let foundColor:{ id: number; name: string; hex: string; paneColor: boolean; }[] = this.sharedDataService.oldColorsData.filter(function(item) { return item.id == Number(splitAutofillString[i]); });
        if(foundColor.length > 0 && Number(splitAutofillString[i]) == Number(baseSplitAutofillString[paneId])) {
          tmpHex = foundColor[0].hex;

          // Adding change to last change array
          let previousStyle:string = "fill:#" + this.sharedDataService.panelColoringArray[panelNumber][i];
          let darkPreviousStyle:string = "fill:#" + this.sharedDataService.darkPanelColoringArray[panelNumber][i];
          this.recentChanges[this.recentChanges.length-1].push([String(panelNumber), String(i), previousStyle]);
          this.darkRecentChanges[this.darkRecentChanges.length-1].push([String(panelNumber), String(i), darkPreviousStyle]);

          if(this.sharedDataService.currentTemplateNumber == panelNumber) {document.getElementById("pane"+i)?.setAttribute("style", "fill:#"+(this.isDarkMode() ? this.sharedDataService.currentSelectedColor.darkHex: this.sharedDataService.currentSelectedColor.hex));}
          document.getElementById("windowPane"+panelNumber+"_"+i)?.setAttribute("style", "fill:#"+(this.isDarkMode() ? this.sharedDataService.currentSelectedColor.darkHex: this.sharedDataService.currentSelectedColor.hex));
          document.getElementById("windowPaneFinished"+panelNumber+"_"+i)?.setAttribute("style", "fill:#"+(this.isDarkMode() ? this.sharedDataService.currentSelectedColor.darkHex: this.sharedDataService.currentSelectedColor.hex));
          this.sharedDataService.panelColoringArray[panelNumber][i] = this.sharedDataService.currentSelectedColor.hex;
          this.sharedDataService.darkPanelColoringArray[panelNumber][i] = this.sharedDataService.currentSelectedColor.darkHex;
        }
        //else {tmpHex = foundColor[0].hex;}
        
      }
    }
  }
  
  // Updates the color of the pane selected by the user (also updated the window preview)
  updateSelectedPane(paneID:number):void {
    let previousStyle:string = "fill:#"+this.sharedDataService.panelColoringArray[this.sharedDataService.currentTemplateNumber][paneID];
    let darkPreviousStyle:string = "fill:#"+this.sharedDataService.darkPanelColoringArray[this.sharedDataService.currentTemplateNumber][paneID];
    if(this.sharedDataService.currentPaneColor != "") {
      // Autofill is on
      if((<HTMLInputElement>document.getElementById("customSwitch_autofill"))?.checked) {
        let panelNum:number = 0;
        let baseAutofillString = this.sharedDataService.panelLayout[Math.floor(this.sharedDataService.currentTemplateNumber/this.sharedDataService.panelLayoutDims[0])][this.sharedDataService.currentTemplateNumber%this.sharedDataService.panelLayoutDims[0]].autofillString;

        // Adding new array for changes to be made by each panel getting autofilled
        if(this.recentChanges.length >= this.undoQueueSize) {this.recentChanges.shift(); this.darkRecentChanges.shift;}
        this.recentChanges.push([]);
        this.darkRecentChanges.push([]);
        
        for(let row of this.sharedDataService.panelLayout) {
          for(let svgTemplate of row) {
            // if(panelNum == 0) {baseAutofillString = svgTemplate.autofillString;}
            this.autofillPanel(svgTemplate.autofillString, baseAutofillString, panelNum, paneID);
            ++panelNum;
          }
        }
      }
      // Autofill is off
      else {
        // Adding change to recent changes
        if(this.recentChanges.length < this.undoQueueSize) {
          this.recentChanges.push([[String(this.sharedDataService.currentTemplateNumber), String(paneID), previousStyle]]); 
          this.darkRecentChanges.push([[String(this.sharedDataService.currentTemplateNumber), String(paneID), darkPreviousStyle]]);
        }
        else {
          this.recentChanges.shift(); this.recentChanges.push([[String(this.sharedDataService.currentTemplateNumber), String(paneID), previousStyle]]);
          this.darkRecentChanges.shift(); this.darkRecentChanges.push([[String(this.sharedDataService.currentTemplateNumber), String(paneID), darkPreviousStyle]]);
        }
        
        document.getElementById("pane"+paneID)?.setAttribute("style", "fill:#"+ (this.isDarkMode() ? this.sharedDataService.currentSelectedColor.darkHex: this.sharedDataService.currentSelectedColor.hex));
        document.getElementById("windowPane"+this.sharedDataService.currentTemplateNumber+"_"+paneID)?.setAttribute("style", "fill:#"+(this.isDarkMode() ? this.sharedDataService.currentSelectedColor.darkHex: this.sharedDataService.currentSelectedColor.hex));
        document.getElementById("windowPaneFinished"+this.sharedDataService.currentTemplateNumber+"_"+paneID)?.setAttribute("style", "fill:#"+(this.isDarkMode() ? this.sharedDataService.currentSelectedColor.darkHex: this.sharedDataService.currentSelectedColor.hex));
        this.sharedDataService.panelColoringArray[this.sharedDataService.currentTemplateNumber][paneID] = this.sharedDataService.currentPaneColor;
        this.sharedDataService.darkPanelColoringArray[this.sharedDataService.currentTemplateNumber][paneID] = this.sharedDataService.currentSelectedColor.darkHex;
      }
    }
    this.sharedDataService.currentPaneID = "pane"+paneID;
  }
  

  // Undoes the last change recent changes array : [templateNum, paneID, style]
  undoChange():void {
    if(this.recentChanges.length > 0) {

      let recentChangeArray:string[][] = this.recentChanges.pop()!;
      let darkRecentChangeArray:string[][] = this.darkRecentChanges.pop()!;
      while(recentChangeArray.length > 0) {
        
        let recentChange:string[] = recentChangeArray.pop()!;;
        let darkRecentChange:string[] = darkRecentChangeArray.pop()!;
        if(recentChange[0] == String(this.sharedDataService.currentTemplateNumber)) {
          document.getElementById("pane"+recentChange[1])?.setAttribute("style", (this.isDarkMode() ? darkRecentChange[2] : recentChange[2]) );
        }
        this.sharedDataService.panelColoringArray[Number(recentChange[0])][Number(recentChange[1])] = recentChange[2].substring(6);
        this.sharedDataService.darkPanelColoringArray[Number(recentChange[0])][Number(recentChange[1])] = darkRecentChange[2].substring(6);
        document.getElementById("windowPane"+recentChange[0]+"_"+recentChange[1])?.setAttribute("style",(this.isDarkMode() ? darkRecentChange[2] : recentChange[2]));
        document.getElementById("windowPaneFinished"+recentChange[0]+"_"+recentChange[1])?.setAttribute("style", (this.isDarkMode() ? darkRecentChange[2] : recentChange[2]));
      }
    }
    

  }

  isDarkMode():boolean {
    return (<HTMLInputElement>document.getElementById("customSwitch_DarkMode"))?.checked;
  }

  refreshCurrentPanel():void {
    let numPanes = this.sharedDataService.numberPanes;
    for(let i = 0; i < numPanes; ++i) {
      document.getElementById("pane"+i)?.setAttribute("style", "fill:#"+ (this.isDarkMode() ? this.sharedDataService.darkPanelColoringArray[this.sharedDataService.currentTemplateNumber][i] : this.sharedDataService.panelColoringArray[this.sharedDataService.currentTemplateNumber][i]))
    }
  }
  
    // Method to clear old panes
    clearOldPanes():void {
      let numPanes = this.sharedDataService.numberPanes;
      for(let i = 0; i < numPanes; ++i) {
        document.getElementById("pane"+i)?.setAttribute("d", "");
        document.getElementById("pane"+i)?.setAttribute("style", "")
        document.getElementById("pane"+i)?.setAttribute("transform", "");
      }
      this.sharedDataService.numberPanes = 0;
    }

    displayFirstTemplate():void {
      this.displayTemplate(this.sharedDataService.panelLayout[0][0].getOptimizedD(), 0, 0);
    }

    // Updates current template in display window with selected version
    displayTemplate(svgD:string, row:number, col:number):void {
      this.clearOldPanes();
      this.sharedDataService.currentSvgTemplate = new SVGTemplate(svgD);
      this.sharedDataService.currentTemplateNumber = row*this.sharedDataService.panelLayoutDims[0] + col;
      let newTemplate:SVGTemplate = this.sharedDataService.currentSvgTemplate;

      let numPane:number = 0; // <-- In case the outer edge is not the first element
      // Adding each individual pane
      for(let i = 0; i < newTemplate.subShapes.length; ++i) {
        if(i != newTemplate.outerEdgeIndex) {
          document.getElementById("pane"+numPane)?.setAttribute("d", newTemplate.subShapes[i].getScalablePath());
          
          // Filling the pane with a saved color or blank
          let savedStyle = document.getElementById("windowPane"+this.sharedDataService.currentTemplateNumber+"_"+numPane)?.getAttribute("style");
          if(savedStyle != null) {document.getElementById("pane"+numPane)?.setAttribute("style", "fill:#"+savedStyle.substring(6));}
          else {document.getElementById("pane"+numPane)?.setAttribute("style", "fill:#f0f0f1");}
          ++numPane;
        }
      }
      this.sharedDataService.numberPanes = numPane;

      
      // Updating the current displayed template
      document.getElementById("svgTemplate")?.setAttribute("d", newTemplate.getOptimizedD());

      let viewboxValue:string = ""+newTemplate.xMin+" "+newTemplate.yMin+" "+newTemplate.width+" "+newTemplate.height;
      document.getElementById("currentTemplate")?.setAttribute("viewBox", viewboxValue);
      document.getElementById("svgTemplate")?.setAttribute("transform", "");
      // document.getElementById("currentTemplate")?.setAttribute("width", ""+newTemplate.width+"mm");
      // document.getElementById("currentTemplate")?.setAttribute("height", ""+newTemplate.height+"mm");
    }

    nextstage5() {
      document.getElementById("stage5")?.setAttribute("style", "visibility:visible;")
      document.getElementById("stage5")?.scrollIntoView({behavior: 'smooth'});
    }

    previousStage() {
      document.getElementById("templateCategoryStage")?.scrollIntoView({behavior: 'smooth'});
    }

    // Changes color of frame
    changeFrameColor(hexValue:string):void {
      document.getElementById("button_"+this.sharedDataService.currentFilamentColor+"_false")?.setAttribute("style", "");
      document.getElementById("button_"+hexValue+"_false")?.setAttribute("style", "border:1px solid #0000ff");
      this.sharedDataService.currentFilamentColor = hexValue;
      document.getElementById("svgTemplate")?.setAttribute("style", "fill:#"+this.sharedDataService.currentFilamentColor);
      for(let i = 0; i < this.sharedDataService.panelLayoutDims[0]*this.sharedDataService.panelLayoutDims[1]; ++i) {
        document.getElementById("windowSVG"+i)?.setAttribute("style", "fill:#"+this.sharedDataService.currentFilamentColor+";");
        document.getElementById("windowSVGFinished"+i)?.setAttribute("style", "fill:#"+this.sharedDataService.currentFilamentColor+";");
      }
    }
}
