import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Model, IndexInterface } from './model';

import { environment } from '../../environments/environment';

@Injectable()
export class RecipesService extends Model {
  override index: IndexInterface[] = [
    {
      indexName: 'type',
      keyPath: 'type',
    },
  ];
  constructor(http: HttpClient) {
    super(http, `${environment.erp}/v1/`, 'recipes');
  }

  findByProduct(product: any) {
    if (!product) {
      return null;
    }
    return this.data.find((recipe: any) => {
      if (recipe.productId) {
        return product._id === recipe.productId;
      }
      if (product.articleNr && recipe.articleNr) {
        return (
          product.articleNr.toLowerCase() === recipe.articleNr.toLowerCase()
        );
      }
      return false;
    });
  }

  getCertificateOfAnalysis(recipeId: string) {
    return this.http.get(
      `${this.host}${this.type}/${recipeId}/certificate-of-analysis`
    );
  }
}
