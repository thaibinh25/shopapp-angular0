import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, NgForm, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../service/user.service';
import { RegisterDTO } from '../../dtos/user/register.dto';
import { UserResponse } from '../../responses/user/user.response';
import { TokenService } from '../../service/token.service';
import { UpdateUserDTO } from '../../dtos/user/update.user.dto';
import { ReactiveFormsModule } from '@angular/forms';
import { IsPhoneNumber } from 'class-validator';
import { UpdateUserProfileDTO } from '../../dtos/user/update.user.profile.dto';
import { TranslateModule } from '@ngx-translate/core';

declare const google: any;
@Component({
  selector: 'user-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, TranslateModule],
  providers: [HttpClient, Router],
  templateUrl: './user.profile.component.html',
  styleUrls: ['./user.profile.component.scss']
})

export class UserProfileComponent implements OnInit {
  activeTab: 'info' | 'contact' | 'password' = 'info';
  isEditingContact = false;
  userResponse?: UserResponse;
  token: string = '';
  userContactForm!: FormGroup;
  changePasswordForm!: FormGroup;


  user = {
    fullname: '  ',
    dateOfBirth: new Date(),
    address: '',
    phoneNumber: '',
  };

  passwordData = {
    current_password: '',
    new_password: '',
    confirm_password: ''
  };

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private router: Router,
    private tokenService: TokenService,
    private cdr: ChangeDetectorRef,
  ) {
    this.userContactForm = this.formBuilder.group({
      address: [this.user.address, Validators.required],
      phone_number: [this.user.phoneNumber, [
        Validators.required,
        Validators.pattern(/^0\d{9,10}$/)
      ]]
    });

    this.changePasswordForm = this.formBuilder.group({
      current_password: ['', Validators.required],
      new_password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    debugger
    this.token = this.tokenService.getToken() ?? '';
    this.userService.getUserProfile().subscribe({
      next: (response: any) => {
        debugger
        this.user.fullname = response.fullName;
        this.user.dateOfBirth = new Date(response.date_of_birth);
        this.userContactForm.patchValue({
          address: response.address ?? '',
          phone_number: response.phone_number
        });

      },
      complete: () => {
        debugger;
      },
      error: (error: any) => {
        debugger;
        alert(error.error.message);
      }
    })

    // Gõ vào là check khớp ngay, nhưng vẫn không hiện nếu chưa nhập
    this.changePasswordForm.get('confirm_password')?.valueChanges.subscribe(() => {
      this.changePasswordForm.get('confirm_password')?.markAsTouched();
      this.changePasswordForm.updateValueAndValidity();
    });

    this.changePasswordForm.get('new_password')?.valueChanges.subscribe(() => {
      this.changePasswordForm.get('confirm_password')?.markAsTouched();
      this.changePasswordForm.updateValueAndValidity();
    });

  }

  toggleEditContact(): void {
    if (this.isEditingContact) {
      // TODO: Gọi API cập nhật thông tin liên hệ ở đây nếu cần
      console.log('Cập nhật địa chỉ & SĐT:', this.user);
    }
    this.isEditingContact = !this.isEditingContact;
  }

  changePassword(): void {
    if (this.passwordData.new_password !== this.passwordData.confirm_password) {
      alert('Mật khẩu mới không khớp.');
      return;
    }

    // TODO: Gọi API để đổi mật khẩu ở đây
    console.log('Đổi mật khẩu với dữ liệu:', this.passwordData);

    // Reset form
    this.passwordData = {
      current_password: '',
      new_password: '',
      confirm_password: ''
    };
    alert('Mật khẩu đã được cập nhật!');
  }

  passwordMatchValidator(group: FormGroup) {
    const new_password = group.get('new_password')?.value;
    const confirm_password = group.get('confirm_password')?.value;
    return new_password === confirm_password ? null : { passwordMismatch: true };
  }

  updateContactInfo(): void {
    debugger
    if (this.userContactForm.value) {
      const dto: UpdateUserProfileDTO = {
        address: this.userContactForm.get('address')?.value ?? '',
        phone_number: this.userContactForm.get('phone_number')?.value ?? ''
      };

      this.userService.updateUserProfile(dto).subscribe({
        next: (response) => {
          alert(response.message);
          // Cập nhật lại `user` local nếu cần
          //if (response.newToken) {
           // localStorage.setItem('token', response.newToken);
          
            //this.router.navigate(['/login']);
          //}
        },
        error: (err) => {
          console.error(' Lỗi cập nhật thông tin:', err);
          alert('Có lỗi xảy ra khi cập nhật thông tin!');
        }
      });
    }
  }

  updatePassword(): void {
    debugger
    if (this.changePasswordForm.valid) {
      const { current_password, new_password } = this.changePasswordForm.value;
      this.userService.changePassword({ current_password, new_password }).subscribe({
        next: (response) => {
          debugger
          alert(response.message);
          this.changePasswordForm.reset();
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error(' Lỗi đổi mật khẩu:', err);
          alert(' Mật khẩu hiện tại không đúng hoặc có lỗi!');
        }
      });
    }
  }
}

