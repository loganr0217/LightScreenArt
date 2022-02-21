import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { SVGTemplate } from '../svgScaler';
import { Polygon } from '../svgScaler';

@Component({
  selector: 'app-window-preview-container',
  templateUrl: './window-preview-container.component.html',
  styleUrls: ['./window-preview-container.component.css']
})
export class WindowPreviewContainerComponent implements OnInit {

  constructor(private sharedDataService:SharedDataService) { }

  // Method to move to next pane in window
  nextPane():void {
    if(this.sharedDataService.currentTemplateNumber != -1) {
      ++this.sharedDataService.currentTemplateNumber;
      this.sharedDataService.currentTemplateNumber %= this.sharedDataService.svgTemplateData[this.sharedDataService.currentWindowNumber].length;
      this.clearOldPanes();
      this.displayTemplate(this.sharedDataService.svgTemplateData[this.sharedDataService.currentWindowNumber][this.sharedDataService.currentTemplateNumber].d);
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

  // Updates current template in display window with selected version
  displayTemplate(svgD:string):void {
    this.sharedDataService.currentSvgTemplate = new SVGTemplate(svgD);
    let newTemplate:SVGTemplate = this.sharedDataService.currentSvgTemplate;

    let numPane:number = 0; // <-- In case the outer edge is not the first element
    // Adding each individual pane
    for(let i = 0; i < newTemplate.subShapes.length; ++i) {
      if(i != newTemplate.outerEdgeIndex) {
        document.getElementById("pane"+numPane)?.setAttribute("d", newTemplate.subShapes[i].getScalablePath());
        
        // Filling the pane with a saved color or blank
        let savedStyle = document.getElementById("windowPane"+this.sharedDataService.currentTemplateNumber+"_"+numPane)?.getAttribute("style");
        if(savedStyle != null) {document.getElementById("pane"+numPane)?.setAttribute("style", savedStyle);}
        else {document.getElementById("pane"+numPane)?.setAttribute("style", "fill:#ffffff");}
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

  ngOnInit(): void {
  }

}