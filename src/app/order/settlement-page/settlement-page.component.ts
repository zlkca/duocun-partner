import { Component, OnInit, OnDestroy } from '@angular/core';
import { IAccount, Role } from '../../account/account.model';
import { AccountService } from '../../account/account.service';
import { SharedService } from '../../shared/shared.service';
import { RestaurantService } from '../../restaurant/restaurant.service';
import { ActivatedRoute, Router } from '../../../../node_modules/@angular/router';
import { IRestaurant } from '../../restaurant/restaurant.model';
import { Subject } from '../../../../node_modules/rxjs';
import { takeUntil } from '../../../../node_modules/rxjs/operators';

@Component({
  selector: 'app-settlement-page',
  templateUrl: './settlement-page.component.html',
  styleUrls: ['./settlement-page.component.scss']
})
export class SettlementPageComponent implements OnInit, OnDestroy {

  account: IAccount;
  rangeDay;
  rangeWeek;
  rangeMonth;
  onDestroy$ = new Subject();
  restaurant: IRestaurant;
  deliverTime;

  constructor(
    private restaurantSvc: RestaurantService,
    private sharedSvc: SharedService,
    private accountSvc: AccountService,
    private router: Router,
    private route: ActivatedRoute
  ) {

  }

  ngOnInit() {
    const self = this;
    self.accountSvc.getCurrent().pipe(takeUntil(this.onDestroy$)).subscribe(account => {
        const roles = account.roles;
        if (roles && roles.length > 0 && roles.indexOf(Role.MERCHANT_ADMIN) !== -1 && account.merchants && account.merchants.length > 0) {
          const merchantId = account.merchants[0];
          self.restaurantSvc.find({ _id: merchantId }).pipe(takeUntil(this.onDestroy$)).subscribe((rs: IRestaurant[]) => {
            if (rs && rs.length > 0) {
              self.restaurant = rs[0];
            } else {
              self.restaurant = null;
            }
          });
        } else { // not authorized for opreration merchant
          this.router.navigate(['account/setting'], { queryParams: { merchant: false } });
        }
    });

    // this.socketSvc.on('updateOrders', x => {
    //   // self.onFilterOrders(this.selectedRange);
    //   if (x.clientId === self.account.id) {
    //     const index = self.orders.findIndex(i => i.id === x.id);
    //     if (index !== -1) {
    //       self.orders[index] = x;
    //     } else {
    //       self.orders.push(x);
    //     }
    //     self.orders.sort((a: Order, b: Order) => {
    //       if (this.sharedSvc.compareDateTime(a.created, b.created)) {
    //         return -1;
    //       } else {
    //         return 1;
    //       }
    //     });
    //   }
    // });
  }
  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
  onSelect(c) {
    // this.select.emit({ order: c });
  }

  toDateTimeString(s) {
    return s ? this.sharedSvc.toDateTimeString(s) : '';
  }

}
