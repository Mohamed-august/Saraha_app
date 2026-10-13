import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);

  async googleLogin(idToken: string) {
    return this.http.post(
      'http://localhost:3000/users/signup/gmail',
      { idToken }
    ).subscribe((res:any) => {
      console.log({ res });

    });
  }
}
