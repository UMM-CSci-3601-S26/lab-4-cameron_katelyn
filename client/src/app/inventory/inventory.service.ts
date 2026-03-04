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
  private http = inject(HttpClient);
  private inventoryUrl = `${environment.apiUrl}inventory`;

  getInventory(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(this.inventoryUrl);
  }

  getInventoryById(id: string): Observable<InventoryItem> {
    return this.http.get<InventoryItem>(`${this.inventoryUrl}/${id}`);
  }

  addInventory(item: Partial<InventoryItem>): Observable<string> {
    return this.http
      .post<{ id: string }>(this.inventoryUrl, item)
      .pipe(map(res => res.id));
  }

  updateQuantity(id: string, quantity: number): Observable<void> {
    return this.http.put<void>(`${this.inventoryUrl}/${id}`, { quantityAvailable: quantity });
  }

  deleteInventory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.inventoryUrl}/${id}`);
  }
}
