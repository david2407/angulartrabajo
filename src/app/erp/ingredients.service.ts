import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import groupBy from 'lodash-es/groupBy';
import { Model } from './model';

import { environment } from '../../environments/environment';

export interface Delivery {
  supplier?: string;
  supplierId: string;
  workplaceId?: string;
  currency: string;
  quantity: number;
  price: number;
  batch: number;
  expirationDate: Date;
}

interface Inventory {
  workplaceId: string;
  quantity: number;
}

@Injectable()
export class IngredientsService extends Model {
  groups: any;
  constructor(http: HttpClient) {
    super(http, `${environment.erp}/v1/`, 'ingredients');

    this.onData.subscribe(() => {
      this.groups = groupBy(this.data, (item) => item.category);
    });
  }

  saveDelivery(data: Delivery, id: string) {
    return this.http.post(`${this.host}${this.type}/${id}/delivery`, data);
  }

  fetchSold(opts?: any) {
    return this.http.get(`${this.host}${this.type}/sold`, opts);
  }

  removeInventory(id, data: Inventory) {
    return this.http.post(
      `${this.host}${this.type}/${id}/remove-inventory`,
      data
    );
  }

  getItemQty(inventory: any): number {
    let qty = 0;
    if (Array.isArray(inventory)) {
      for (const item of inventory) {
        qty += item.quantity || 0;
      }
    }
    return qty;
  }

  getItemQtyChange(inventoryChange) {
    let addToQuantity = 0;
    let removeFromQuantity = 0;

    for (const key in inventoryChange) {
      addToQuantity += inventoryChange[key].addToQuantity || 0;
      removeFromQuantity += inventoryChange[key].removeFromQuantity || 0;
    }

    return { addToQuantity, removeFromQuantity };
  }

  getItemQtyPerWorkplace(inventory) {
    let data = {};
    if (Array.isArray(inventory)) {
      for (const item of inventory) {
        data[item.workplaceId] ??= 0;
        data[item.workplaceId] += item.quantity;
      }
    }
    return data;
  }

  getItemBatchPerWorkplace(inventory) {
    const data = {};
    if (Array.isArray(inventory)) {
      for (const item of inventory) {
        if (Array.isArray(item.batchList)) {
          data[item.workplaceId] ??= [];
          data[item.workplaceId].push(...item.batchList);
        }
      }
    }
    return data;
  }
}
