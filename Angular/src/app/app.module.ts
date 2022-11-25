import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'

import { app_routing } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { ChatComponent } from './components/chat/chat.component';
import { DrawingFieldComponent } from './components/drawing-field/drawing-field.component';
import { DrawingCanvasComponent } from './components/drawing-canvas/drawing-canvas.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ChatComponent,
    DrawingFieldComponent,
    DrawingCanvasComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    app_routing
    /*AppRoutingModule*/
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
