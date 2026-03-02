import { Component, Input} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
//import { RouterLink } from '@angular/router';
import { Family } from './family';
@Component({
  selector: 'app-family-card',
  templateUrl: './family-card.component.html',
  styleUrls: ['./family-card.component.scss'],
  imports: [MatCardModule, MatButtonModule, MatListModule, MatIconModule]
  //, RouterLink
})

export class FamilyCardComponent {
  @Input({ required: true }) family!: Family;
}
