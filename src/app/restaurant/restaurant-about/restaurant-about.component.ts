import { Component, OnInit, Input } from '@angular/core';
import { IMerchant } from '../restaurant.model';
import { Address } from '../../entity.model';

@Component({
  selector: 'app-restaurant-about',
  templateUrl: './restaurant-about.component.html',
  styleUrls: ['./restaurant-about.component.css']
})
export class RestaurantAboutComponent implements OnInit {

  @Input() restaurant: IMerchant;

  phoneNumber: number;
  address: Address;
  operatingHours: string;
  formattedAddress: string;

  constructor() { }

  ngOnInit() {
    const rst = this.restaurant;
    if (rst) {
      this.restaurant = rst;
      this.address = rst.address;
      this.formattedAddress = 'Unit ' + this.address.unit + ', ' + this.address.streetNumber + ' ' +
        this.address.streetName + ' ' + this.address.city + ' ' + this.address.province;
      this.phoneNumber = 12344567890;
      this.operatingHours = '10:00 - 23:00';
    }
  }

}
