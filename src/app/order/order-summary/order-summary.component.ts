import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { AccountService } from '../../account/account.service';
import { OrderService } from '../../order/order.service';
import { SharedService } from '../../shared/shared.service';
import { IOrderItem, IOrder } from '../order.model';
// import { SocketService } from '../../shared/socket.service';
import { IRestaurant, IPhase } from '../../restaurant/restaurant.model';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { Subject } from '../../../../node_modules/rxjs';
import * as moment from 'moment';
import { ProductService } from '../../product/product.service';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-order-summary',
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.scss']
})
export class OrderSummaryComponent implements OnInit, OnChanges, OnDestroy {
  @Input() restaurant: IRestaurant;

  orders: IOrder[] = [];
  list: IOrderItem[];
  ordersWithNote: IOrder[] = [];
  onDestroy$ = new Subject();

  constructor(
    private orderSvc: OrderService,
    private productSvc: ProductService,
    private sharedSvc: SharedService,
  ) {

  }
  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit() {
    const self = this;
    if (this.restaurant) {
      self.reload(this.restaurant);
    } else {
      self.orders = [];
    }

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

  reload(merchant: IRestaurant) {
    const self = this;
    const query = {
      merchantId: merchant._id,
      delivered: { $lt: moment().endOf('day').toISOString(), $gt: moment().startOf('day').toISOString() },
      status: { $nin: ['del', 'tmp'] }
    };

    this.orderSvc.find(query).pipe(takeUntil(this.onDestroy$)).subscribe(orders => {
      merchant.phases.map((phase: IPhase) => {
        phase.orders = [];
      });

      // const list = [];
      // const ordersWithNote = [];

      orders.map((order: IOrder) => {
        // const noteItems = [];
        if (environment.language === 'en') {
          order.items.map(item => {
            item.productName = item.product.nameEN;
            item.product.name = item.product.nameEN;
          });
        }
        // order.items.map(item => {
        //   const it = list.find(x => x.product._id === item.product._id);
        //   const product = item.product;

        //   if (it) {
        //     it.quantity = it.quantity + item.quantity;
        //   } else {
        //     if (product && product.categoryId !== '5cbc5df61f85de03fd9e1f12') { // not drink
        //       list.push(item);
        //     }
        //   }
        //   if (product && product.categoryId !== '5cbc5df61f85de03fd9e1f12') { // not drink
        //     noteItems.push(item);
        //   }
        // });

        // if (order.note) {
        //   ordersWithNote.push({note: order.note, items: noteItems});
        // }
      });

      merchant.phases.map((phase: IPhase) => {
        phase.orders = orders.filter(o => this.sharedSvc.isSameTime(o.delivered, phase.pickup));

        phase.items = this.getItemList(phase.orders);
        phase.ordersWithNote = this.getNoteList(phase.orders);
      });

      // self.list = list;
      // self.ordersWithNote = ordersWithNote;
      // self.orders = orders;

      self.restaurant = merchant;
    });
  }

  getNoteList(orders) {
    const ordersWithNote = [];

    orders.map(order => {
      const noteItems = [];

      order.items.map(item => {
        const product = item.product;

        if (product && product.categoryId !== '5cbc5df61f85de03fd9e1f12') { // not drink
          noteItems.push(item);
        }
      });

      if (order.note) {
        ordersWithNote.push({ note: order.note, items: noteItems });
      }
    });

    return ordersWithNote;
  }

  getItemList(orders) {
    const list = [];
    orders.map(order => {
      order.items.map(item => {
        const it = list.find(x => x.productId === item.product._id);
        if (it) {
          it.quantity = it.quantity + item.quantity;
        } else {
          if (item.product && item.product.categoryId !== '5cbc5df61f85de03fd9e1f12') { // not drink
            list.push(item);
          }
        }
        // if (product && product.categoryId !== '5cbc5df61f85de03fd9e1f12') { // not drink
        //   noteItems.push(item);
        // }
      });
    });
    return list;
  }



  ngOnChanges(v) {
    if (v.restaurant && v.restaurant.currentValue) {
      const restaurant = v.restaurant.currentValue;
      this.reload(restaurant);
    }
  }

  onSelect(c) {
    // this.select.emit({ order: c });
  }

  toDateTimeString(s) {
    return s ? this.sharedSvc.toDateTimeString(s) : '';
  }
}
