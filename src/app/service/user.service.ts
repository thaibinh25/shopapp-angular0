import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { RegisterDTO } from '../dtos/user/register.dto';
import { LoginDTO } from '../dtos/user/login.dto';
import { environment } from '../../environments/environment';
import { UserResponse } from '../responses/user/user.response';
import { UpdateUserDTO } from '../dtos/user/update.user.dto';
import { UserProfileResponse } from '../responses/user/user.profile.response';
import { UpdateUserProfileDTO } from '../dtos/user/update.user.profile.dto';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private api = `${environment.apiBaseUrl}/users`;
  private apiRegister = `${environment.apiBaseUrl}/users/register`;
  private apiLogin = `${environment.apiBaseUrl}/users/login`;
  private apiUserDetail = `${environment.apiBaseUrl}/users/details`;
  
  private apiConfing = {
    headers: this.createHeaders(),
  }
  private userSubject = new BehaviorSubject<UserResponse | null>(null);
  public user$ = this.userSubject.asObservable(); 

  constructor(private http: HttpClient) { }

  private createHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type' : 'application/json',
      'Accept-Language': 'vi'
    })

  }

  getAllUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.api}`, {
      headers: this.createHeaders()
    });
  }

  getUserProfile(): Observable<UserProfileResponse>{
    return this.http.get<UserProfileResponse>(`${this.api}/profile`,{
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    })
  }

  updateUserProfile(dto: UpdateUserProfileDTO): Observable<{message: string; newToken?: string}> {
    return this.http.put<{message: string; newToken?: string}>(`${this.api}/profile`, dto,{
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }

  changePassword(data: { current_password: string; new_password: string }): Observable<any> {
    return this.http.post(`${this.api}/change-password`, data,{
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }

  register(registerDTO: RegisterDTO): Observable<any> {
    return this.http.post(this.apiRegister, registerDTO, {
      headers: this.createHeaders()
    });
  }
  
  login(loginDTO: LoginDTO): Observable<any> {
    return this.http.post(this.apiLogin, loginDTO, {
      headers: this.createHeaders()
    });
  }
  getUserDetail(token: string): Observable<any> {
    return this.http.post(this.apiUserDetail, {}, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    });
  }
  

  saveUserResponseToLocalStorage(userResponse?: UserResponse){
    try{
      debugger
      if (userResponse == null || !userResponse){
        return;
      }
      const userResponseJSON = JSON.stringify(userResponse);

      localStorage.setItem('user', userResponseJSON);
      this.userSubject.next(userResponse); // 🔥 phát sự kiện // cập nhật observable

      console.log('User Response saved to local storate.');
    }catch(error){
      console.error('Error saving user response to local storage:', error);
    }
    
  }

  getUserResponseToLocalStorage(){
    try{
     
      const userResponseJSON = localStorage.getItem('user');
      if (userResponseJSON == null || userResponseJSON == undefined){
        return null;
      }

      const userResponse = JSON.parse(userResponseJSON!);

      console.log('User Response saved to local storate.');
      return userResponse;
    }catch(error){
      console.error('Error saving user response to local storage:', error);
      return null;
    }
    
  }


  getUserResponseFromLocalStorage():UserResponse | null {
    try {
      // Retrieve the JSON string from local storage using the key
      const userResponseJSON = localStorage.getItem('user'); 
      if(userResponseJSON == null || userResponseJSON == undefined) {
        return null;
      }
      // Parse the JSON string back to an object
      const userResponse = JSON.parse(userResponseJSON!);  
      this.userSubject.next(userResponse); // Gán luôn cho subject // cập nhật observable ngay khi gọi
      console.log('User response retrieved from local storage.');
      return userResponse;
    } catch (error) {
      console.error('Error retrieving user response from local storage:', error);
      return null; // Return null or handle the error as needed
    }
  }
  updateUserDetail(token: string, updateUserDTO: UpdateUserDTO) {
    debugger
    let userResponse = this.getUserResponseFromLocalStorage();        
    return this.http.put(`${this.apiUserDetail}/${userResponse?.id}`,updateUserDTO,{
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      })
    })
  }


  removeUserFromLocalStorage():void {
    try {
      // Remove the user data from local storage using the key
      localStorage.removeItem('user');
      console.log('User data removed from local storage.');
    } catch (error) {
      console.error('Error removing user data from local storage:', error);
      // Handle the error as needed
    }
  }

 // Dùng cho đăng nhập gôgole 
  setUser(user: UserResponse) {
    this.userSubject.next(user);
    localStorage.setItem('user', JSON.stringify(user));
  }
  
  // Dùng cho đăng nhập gôgole 
  getUserObservable(): Observable<UserResponse | null> {
    return this.userSubject.asObservable();
  }
  

}
