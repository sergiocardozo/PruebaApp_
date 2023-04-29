import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';

import { User } from '../shared/user.interface';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import * as auth from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public userData: any;

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore, private router: Router, private ngZone: NgZone) {
    this.afAuth.authState.subscribe((user) => {

      if(user){
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('user'));

      } else {
        localStorage.setItem('user', null);
        JSON.parse(localStorage.getItem('user'))
      }
    })  
  }

  signIn(email, password) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  registerUser(email, password) {
    return this.afAuth.createUserWithEmailAndPassword(email, password);
  }

  sendVerification() {
    return this.afAuth.currentUser.then((user) => {
      return user.sendEmailVerification().then(() => {
        this.router.navigate(['login']);
      })
    })
  }

  passwordRecover(passwordResetEmail) {
    return this.afAuth.sendPasswordResetEmail(passwordResetEmail).then(() => {
      console.log('Password reset email has been send email, please check your inbox');
    }).catch((error) => {
      console.log('Error: ',error);
    })
  }

  /* Returns true when users is logged in */
  isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return user !== null ? true : false;
  }
  
  /* Return true when users email is verified */
  get isEmailVerified(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return user.emailVerified !== false ? true : false;
  }

  googleAuth() {
    return this.authLoggin(new auth.GoogleAuthProvider());
  }

  authLoggin(provider) {
    return this.afAuth.signInWithPopup(provider).then((response) => {
      this.ngZone.run(() => {
        this.router.navigate(['home']);
      });
      this.setUserData(response.user);
    }).catch((error) => {
      console.log('Error auth: ', error);
    })
  }

  setUserData(user) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);

    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
    };

    return userRef.set(userData, { merge: true });

  }

  signOut() {
    return this.afAuth.signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['login']);
    })
  }
}
