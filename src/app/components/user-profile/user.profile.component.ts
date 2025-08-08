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
import { TranslateModule, TranslateService } from '@ngx-translate/core';

declare const google: any;
interface PaymentMethod {
  id: string;
  type: 'credit' | 'bank';
  name: string;
  details: string;
  isDefault: boolean;
}
@Component({
  selector: 'user-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, TranslateModule],
  providers: [HttpClient, Router],
  templateUrl: './user.profile.component.html',
  styleUrls: ['./user.profile.component.scss']
})

export class UserProfileComponent implements OnInit {

  isEditingContact = false;
  userResponse?: UserResponse;
  token: string = '';
  userContactForm!: FormGroup;
  changePasswordForm!: FormGroup;
  activeTab = 'personal';
  dateOfBirthStr: string = '';
  isEditing = {
    personal: false,
    address: false
  };

  hasLocalPassword = false;
  isEditingPassword = false;


  profileTabs = [
    { key: 'personal', label: '個人情報', icon: '👤' },
    { key: 'address', label: '住所情報', icon: '📍' },
    //{ key: 'payment', label: '支払い方法', icon: '💳' },
    //{ key: 'notifications', label: '通知設定', icon: '🔔' },
    { key: 'security', label: 'セキュリティ', icon: '🔒' }
  ];

  user = {
    fullname: '  ',
    email: "",
    dateOfBirth: new Date(),
    address: '',
    zip_code: '',
    prefecture: '',
    city: '',
    address_line1: '',
    address_line2: '',
    phoneNumber: '',
  };

  passwordData = {
    current_password: '',
    new_password: '',
    confirm_password: ''
  };

  paymentMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'credit',
      name: 'VISA ****1234',
      details: '有効期限: 12/26',
      isDefault: true
    },
    {
      id: '2',
      type: 'credit',
      name: 'JCB ****5678',
      details: '有効期限: 08/25',
      isDefault: false
    }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private router: Router,
    private tokenService: TokenService,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService
  ) {
    this.userContactForm = this.formBuilder.group({
      fullname: [this.user.fullname, Validators.required],
      date_of_birth: [this.dateOfBirthStr, Validators.required],
      email: [this.user.email, [Validators.required, Validators.email]],
      address: [this.user.address, Validators.required],
      zip_code: [this.user.zip_code, [Validators.required, Validators.pattern(/^\d{7}$/)]],
      prefecture: [this.user.prefecture, Validators.required],
      city: [this.user.city, Validators.required],
      address_line1: [this.user.address_line1, Validators.required],
      address_line2: [this.user.address_line2,],
      phone_number: [this.user.phoneNumber, [
        Validators.required,
        Validators.pattern(/^0\d{10,11}$/)
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
    this.userService.getUserDetail(this.token).subscribe({
      next: (response: any) => {
        debugger
        this.hasLocalPassword = response.hasPassword;
        this.user.fullname = response.fullname;
        this.user.email = response.email;
        this.user.dateOfBirth = new Date(response.date_of_birth);
        this.dateOfBirthStr = this.user.dateOfBirth
          ? new Date(this.user.dateOfBirth).toISOString().split('T')[0]
          : '';
        this.user.zip_code = response.zip_code;
        this.user.prefecture = response.prefecture;
        this.user.city = response.city;
        this.user.address_line1 = response.address_line1;
        this.user.address_line2 = response.address_line2;
        this.user.phoneNumber = response.phone_number;
        this.userContactForm.patchValue({
          fullname: response.fullname ?? '',
          date_of_birth: this.dateOfBirthStr,
          email: response.email ?? '',
          address: response.address ?? '',
          zip_code: response.zip_code ?? '',
          prefecture: response.prefecture ?? '',
          city: response.city ?? '',
          address_line1: response.address_line1 ?? '',
          address_line2: response.address_line2 ?? '',
          phone_number: response.phone_number
        });
        this.initChangePasswordForm();
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

    this.loadProfileTabs();

  // Khi đổi ngôn ngữ, tự cập nhật lại tabs
  this.translate.onLangChange.subscribe(() => {
    this.loadProfileTabs();
  });

  }

  toggleEditContact(): void {
    if (this.isEditingContact) {
      // TODO: Gọi API cập nhật thông tin liên hệ ở đây nếu cần
      console.log('Cập nhật địa chỉ & SĐT:', this.user);
    }
    this.isEditingContact = !this.isEditingContact;
  }


  loadProfileTabs() {
    this.translate.get([
      'profile.personalInfo',
      'profile.addressInfo',
      'profile.paymentMethods',
      'profile.notifications',
      'profile.securitySettings'
    ]).subscribe(translations => {
      this.profileTabs = [
        { key: 'personal', label: translations['profile.personalInfo'], icon: '👤' },
        { key: 'address', label: translations['profile.addressInfo'], icon: '📍' },
        // { key: 'payment', label: translations['profile.paymentMethods'], icon: '💳' },
        // { key: 'notifications', label: translations['profile.notifications'], icon: '🔔' },
        { key: 'security', label: translations['profile.securitySettings'], icon: '🔒' }
      ];
    });
  }
  /*changePassword(): void {
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
  }*/
    changePassword(): void {
      this.isEditingPassword = !this.isEditingPassword;
      if (!this.isEditingPassword) {
        this.changePasswordForm.reset();
      }
    }

  passwordMatchValidator(group: FormGroup) {
    const new_password = group.get('new_password')?.value;
    const confirm_password = group.get('confirm_password')?.value;
    return new_password === confirm_password ? null : { passwordMismatch: true };
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
    /*updatePassword(): void {
      if (this.changePasswordForm.invalid) return;
  
      const formValue = this.changePasswordForm.value;
      const payload: any = {
        newPassword: formValue.new_password
      };
  
      if (this.hasLocalPassword) {
        payload.currentPassword = formValue.current_password;
      }
  
      this.userService.changePassword(payload).subscribe({
        next: (res) => {
          alert(res.message);
          this.changePasswordForm.reset();
        },
        error: (err) => {
          alert(err.error?.error || 'Có lỗi xảy ra khi cập nhật mật khẩu.');
        }
      });
    }*/

  setActiveTab(tab: string) {
    this.activeTab = tab;
    // Reset editing states when switching tabs
    this.isEditing = {
      personal: false,
      address: false
    };
  }
  toggleEdit(section: 'personal' | 'address') {
    if (this.isEditing[section]) {
      // Save changes
      this.saveChanges(section);
    }
    this.isEditing[section] = !this.isEditing[section];
  }
  saveChanges(section: string) {
    console.log('Saving changes for:', section);
    // Implement save logic
    this.updateContactInfo();
  }

  updateContactInfo(): void {
    debugger
    if (this.userContactForm.value) {
      const dto: UpdateUserProfileDTO = {
        fullname: this.userContactForm.get('fullname')?.value ?? '',
        date_of_birth: this.userContactForm.get('date_of_birth')?.value ?? '',
        address: this.userContactForm.get('address')?.value ?? '',
        zip_code: this.userContactForm.get('zip_code')?.value ?? '',
        prefecture: this.userContactForm.get('prefecture')?.value ?? '',
        city: this.userContactForm.get('city')?.value ?? '',
        address_line1: this.userContactForm.get('address_line1')?.value ?? '',
        address_line2: this.userContactForm.get('address_line2')?.value ?? '',
        phone_number: this.userContactForm.get('phone_number')?.value ?? '',
        email: this.userContactForm.get('email')?.value ?? ''
      };

      this.userService.updateUserProfile(dto).subscribe({
        next: (response) => {
          alert(response.message);
          // ✨ Reload lại chính route hiện tại
          this.router.routeReuseStrategy.shouldReuseRoute = () => false;
          this.router.onSameUrlNavigation = 'reload';
          this.router.navigate([this.router.url]);
        },
        error: (err) => {
          console.error(' Lỗi cập nhật thông tin:', err);
          alert('Có lỗi xảy ra khi cập nhật thông tin!');
        }
      });
    }
  }

  initChangePasswordForm() {
    const controls: any = {
      new_password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', Validators.required]
    };

    if (this.hasLocalPassword) {
      controls.current_password = ['', Validators.required];
    }

    this.changePasswordForm = this.formBuilder.group(
      controls,
      { validators: this.passwordMatchValidator }
    );

    this.changePasswordForm.get('confirm_password')?.valueChanges.subscribe(() => {
      this.changePasswordForm.updateValueAndValidity();
    });

    this.changePasswordForm.get('new_password')?.valueChanges.subscribe(() => {
      this.changePasswordForm.updateValueAndValidity();
    });
  }
  addPaymentMethod() {
    console.log('Add payment method');
  }

  editPaymentMethod(id: string) {
    console.log('Edit payment method:', id);
  }

  setDefaultPayment(id: string) {
    this.paymentMethods.forEach(method => {
      method.isDefault = method.id === id;
    });
  }

  removePaymentMethod(id: string) {
    this.paymentMethods = this.paymentMethods.filter(method => method.id !== id);
  }



  setup2FA() {
    console.log('Setup 2FA');
  }

  viewLoginHistory() {
    console.log('View login history');
  }
}

