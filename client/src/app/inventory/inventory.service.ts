import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { InventoryItem } from './inventory';

@Injectable({
  providedIn: 'root',
})

export class InventoryService {
  private httpClient = inject(HttpClient);
  readonly inventoryUrl = `${environment.apiUrl}inventory`;

  getInventory(): Observable<InventoryItem[]> {
    return this.httpClient.get<InventoryItem[]>(this.inventoryUrl);
  }

  getInventoryById(id: string): Observable<InventoryItem> {
    return this.httpClient.get<InventoryItem>(`${this.inventoryUrl}/${id}`);
  }

  addInventory(item: Partial<InventoryItem>): Observable<string> {
    return this.httpClient
      .post<{ id: string }>(this.inventoryUrl, item)
      .pipe(map(res => res.id));
  }

  updateQuantity(id: string, quantity: number): Observable<void> {
    return this.httpClient.put<void>(`${this.inventoryUrl}/${id}`, { quantityAvailable: quantity });
  }

  deleteInventory(id: string): Observable<unknown> {
    return this.httpClient.delete<void>(`${this.inventoryUrl}/${id}`);
  }
}
