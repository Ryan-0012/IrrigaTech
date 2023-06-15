import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApplicationUserCreate } from 'src/app/models/account/application-user-create.models';
import { ApplicationUserLogin } from 'src/app/models/account/application-user-login.models';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{
  registerForm!: FormGroup;
  loginForm!: FormGroup;

  showNavbar: boolean = false;

  constructor(
    private accountService: AccountService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    if (this.accountService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
   }

  ngOnInit(): void {

    //Register
    this.registerForm = this.formBuilder.group({
      fullnameRegister: [null, [
        Validators.minLength(10),
        Validators.maxLength(30)
      ]],
      usernameRegister: [null, [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(20)
      ]],
      emailRegister: [null, [
        Validators.required,
        Validators.pattern(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i),
        Validators.maxLength(30)
      ]],
      passwordRegister: [null, [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(50)
      ]],
      confirmPasswordRegister: [null, [
        Validators.required
      ]],
    }, {
      validators: this.matchValue
    });



    //Login

    this.loginForm = this.formBuilder.group({
      usernameLogin: [null, [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(20)
      ]],
      passwordLogin: [null, [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(50)
      ]]
    });
  }

  //Register
  formHasError(error: string) {
    return !!this.registerForm.hasError(error);
  }

  isTouchedRegister(field: string) {
    return this.registerForm.get(field)?.touched;
  }

  hasErrorsRegister(field: string) {
    return this.registerForm.get(field)?.errors;
  }

  hasErrorRegister(field: string, error: string) {
    return !!this.registerForm.get(field)?.hasError(error);
  }

  matchValue: ValidatorFn = (control: AbstractControl) => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { isMatching: true };
  }
  

  onSubmitRegister() {
    let applicationUserCreate: ApplicationUserCreate = new ApplicationUserCreate(
      this.registerForm.get("usernameRegister")?.value,
      this.registerForm.get("passwordRegister")?.value,
      this.registerForm.get("emailRegister")?.value,
      this.registerForm.get("fullnameRegister")?.value,
    );

    this.accountService.register(applicationUserCreate).subscribe(() => {
      this.router.navigate(['/home']);
    })
  }


  //Login

  isTouchedLogin(field: string){
    console.log("a")
    return this.loginForm.get(field)?.touched;
  }

  hasErrorsLogin(field: string) {
    return this.loginForm.get(field)?.errors;
  }

  hasErrorLogin(field: string, error: string) {
    return !!this.loginForm.get(field)?.hasError(error);
  }

  onSubmitLogin() {
    let applicationUserLogin: ApplicationUserLogin = new ApplicationUserLogin(
      this.loginForm.get("usernameLogin")?.value,
      this.loginForm.get("passwordLogin")?.value
    );
    this.accountService.login(applicationUserLogin).subscribe(() => {
      this.router.navigate(['/home']);
    });
  }


}
