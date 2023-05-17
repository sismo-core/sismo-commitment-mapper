import {
  OAuth2User,
} from "twitter-api-sdk/dist/OAuth2User";

export class StatelessOAuth2User extends OAuth2User {

  generateStatelessAuthURL(): string {
    const STATE = "commitment-mapper-twitter-v2";
    const CODE_CHALLENGE = "commitment-mapper-challenge";
    return this.generateAuthURL({
      state: STATE,
      code_challenge: CODE_CHALLENGE,
      code_challenge_method: "plain",
    });
  }
  
  requestStatelessAccessToken(code?: string) {
    this.generateStatelessAuthURL()
    return this.requestAccessToken(code)
  }
}