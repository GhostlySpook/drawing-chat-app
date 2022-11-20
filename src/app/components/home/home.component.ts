import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  imagesPaths: any = [];

  constructor() { }

  ngOnInit(): void {
    //Load chat images-----PLACEHOLDER
    this.imagesPaths = ['/assets/img/Aurora.png', '/assets/img/ezgif-3-67ee4f7ac2.gif', 'assets/img/Fe4L639VUAA5oGN.png', 'assets/img/Giratina kart.PNG', 'assets/img/red crayon.png']
  }

}
