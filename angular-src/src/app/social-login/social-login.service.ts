import { Injectable } from '@angular/core';
import { AuthService as SocialAuthService } from 'angularx-social-login';
import { GoogleLoginProvider, FacebookLoginProvider } from 'angularx-social-login';
import { Subject } from 'rxjs';

import { AuthService } from '../core/services';
import { UserProfile } from '../../../../shared/models';

@Injectable()
export class SocialLoginService {
  loginStateChanged: Subject<UserProfile> = new Subject<UserProfile>();

  constructor(private socialAuthService: SocialAuthService,
    private authService: AuthService) {

  }

  signIn(provider: string) {
    return this.signInByProvider(provider).then(socialUser => {
      if (socialUser) {
        const authToken = socialUser.authToken;

        // After the social login succeded, signout from the social service
        this.authService.socialLogin(provider, authToken).then(result => {
          this.socialAuthService.signOut().then(() => {
            this.loginStateChanged.next(result);
          });
        }).catch(
          error => {
            this.loginStateChanged.error(error);
          }
        );
      }
    }).catch(error => {
      console.error(error);
      this.loginStateChanged.error(error);
    });
  }

  private signInByProvider(provider: string) {
    switch (provider) {
      case 'google':
        return this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID);
      case 'facebook':
        return this.socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID);
    }
  }
}
