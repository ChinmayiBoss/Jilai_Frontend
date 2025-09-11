import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OnfidoService { 

  constructor(private http: HttpClient) { }

  /**
   * Gets sdktoken
   * @returns  
   */
  getSDKToken(data: any) {
    return this.http.post(`${environment.API_BASE_URL}user/get-sdk-token`, data);
  }

  /**
   * Gets workflow run id
   * @param id 
   * @returns  
   */
  getWorkflowRunId(id: string, data: any) {
    return this.http.post(`${environment.API_BASE_URL}user/update-work-flow-id?id=${id}`, data);
  }

  /**
   * Checks document uploaded
   * @param data 
   * @returns  
   */
  checkDocumentUploaded(data: any) {
    return this.http.post(`${environment.API_BASE_URL}user/document-upload`, data);
  }
}
