import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Subscription, catchError, interval, startWith, switchMap } from 'rxjs';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { UserRole } from '../core/models';

interface OrderNotification {
  id: number;
  title: string;
  text: string;
  createdAt: Date;
}

@Injectable({ providedIn: 'root' })
export class OrderNotificationService {
  private readonly listenRoles: UserRole[] = ['Admin', 'Waiter', 'Staff'];
  private readonly notificationsSubject = new BehaviorSubject<OrderNotification[]>([]);
  private readonly unreadSubject = new BehaviorSubject(0);
  private pollSub?: Subscription;
  private lastSeenOrderId = 0;
  private initialized = false;
  private audioContext?: AudioContext;

  notifications$ = this.notificationsSubject.asObservable();
  unread$ = this.unreadSubject.asObservable();

  constructor(private api: ApiService, private auth: AuthService) {
    this.auth.currentUser$.subscribe(user => {
      this.stop();
      this.notificationsSubject.next([]);
      this.unreadSubject.next(0);
      this.lastSeenOrderId = 0;
      this.initialized = false;

      if (user && this.listenRoles.includes(user.role)) {
        this.start();
      }
    });

    window.addEventListener('click', () => this.unlockSound(), { once: true });
  }

  markRead() {
    this.unreadSubject.next(0);
  }

  clear() {
    this.notificationsSubject.next([]);
    this.unreadSubject.next(0);
  }

  private start() {
    this.pollSub = interval(8000).pipe(
      startWith(0),
      switchMap(() => this.api.get<any[]>('orders').pipe(catchError(() => EMPTY)))
    ).subscribe(orders => this.handleOrders(orders));
  }

  private stop() {
    this.pollSub?.unsubscribe();
    this.pollSub = undefined;
  }

  private handleOrders(orders: any[]) {
    const sorted = [...orders].sort((a, b) => (a.orderId ?? 0) - (b.orderId ?? 0));
    const newestId = sorted.length ? sorted[sorted.length - 1].orderId ?? 0 : 0;

    if (!this.initialized) {
      this.lastSeenOrderId = newestId;
      this.initialized = true;
      return;
    }

    const newOrders = sorted.filter(order => (order.orderId ?? 0) > this.lastSeenOrderId);
    if (!newOrders.length) return;

    this.lastSeenOrderId = Math.max(this.lastSeenOrderId, newestId);
    const notifications = newOrders.map(order => ({
      id: order.orderId,
      title: `New order #${order.orderId}`,
      text: `Table ${order.table?.tableNumber ?? order.tableId ?? '-'} - ${(order.totalAmount ?? 0).toLocaleString('en-NP', { style: 'currency', currency: 'NPR' })}`,
      createdAt: new Date(order.orderDate ?? Date.now())
    }));

    this.notificationsSubject.next([...notifications, ...this.notificationsSubject.value].slice(0, 8));
    this.unreadSubject.next(this.unreadSubject.value + notifications.length);
    this.playBeep();
  }

  private unlockSound() {
    try {
      this.audioContext ??= new AudioContext();
      this.audioContext.resume();
    } catch {
      // Browser audio is optional; visual notifications still work.
    }
  }

  private playBeep() {
    try {
      this.audioContext ??= new AudioContext();
      this.audioContext.resume();
      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = 880;
      gain.gain.setValueAtTime(0.001, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.16, this.audioContext.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.32);
      oscillator.connect(gain);
      gain.connect(this.audioContext.destination);
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.34);
    } catch {
      // Some browsers block audio until a user gesture. The notification badge remains visible.
    }
  }
}
