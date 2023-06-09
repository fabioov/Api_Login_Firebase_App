import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  docData,
  setDoc,
  updateDoc,
  addDoc,
  getDocs,
  deleteDoc,
} from '@angular/fire/firestore';
import { Tournament } from '../models/tournament';
import { AuthenticationService } from './authentication.service';
import {
  Observable,
  Observer,
  catchError,
  delay,
  from,
  of,
  switchMap,
  tap,
  throwError,
  timer,
} from 'rxjs';
import { getDatabase, ref, child, get, onValue, DataSnapshot } from 'firebase/database';
import { getAuth } from "firebase/auth";

@Injectable({
  providedIn: 'root',
})
export class TournamentsService {
  constructor(
    private firestore: Firestore,
    private authService: AuthenticationService,
  ) {}

  addTournament(tournament: Tournament): Observable<any> {
    return this.authService.currentUser$.pipe(
      switchMap((user) => {
        if (!user?.uid) {
          return throwError(() => new Error('User UID not available'));
        }
        debugger;
        const ref = doc(this.firestore, 'tournaments', tournament?.uid);

        return from(setDoc(ref, tournament));
      })
    );
  }


  deleteTournament(tournament: Tournament): Observable<void> {
    const ref = doc(this.firestore, `tournaments/${tournament.uid}`);
    return from(deleteDoc(ref)).pipe(
      delay(1000), // Wait for 1 second before emitting a value
      tap(() => {
        
      })
    );
  }

  getTournaments(): Observable<any> {
    const tournamentsCollection = collection(this.firestore, 'tournaments');

    return new Observable((observer) => {
      getDocs(tournamentsCollection)
        .then((querySnapshot) => {
          const tournaments = querySnapshot.docs.map((doc) => doc.data());
          observer.next(tournaments);
          console.log(tournaments); // Log the tournaments array
        })
        .catch((error) => {
          console.log('Error retrieving tournaments:', error);
          observer.error(error);
        });
    });
  }
}
