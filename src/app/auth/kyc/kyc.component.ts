import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Onfido } from 'onfido-sdk-ui';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { OnfidoService } from 'src/app/services/onfido.service';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-kyc',
  standalone: true,
  imports: [],
  templateUrl: './kyc.component.html',
  styleUrl: './kyc.component.scss'
})
export class KycComponent implements OnInit {

  userId: string = '';
  workflowRunId: string = '';
  sdkToken: string = "";
  applicantId: string = '';

  constructor(private onfidoService: OnfidoService, private localStorageService: LocalStorageService, private profileService: ProfileService,
    private router: Router, private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.userId = this.localStorageService.getDataByKey('userId');

    if (this.userId){
      this.getProfileDetails();
    }
  }

  /**
   * Gets profile details
   */
  getProfileDetails() {
    this.profileService.getProfile(this.userId).subscribe({
      next: (response: any) => {
        this.applicantId = response.data.applicant_id;

        if (this.applicantId) {
          this.getSDKToken();
        }
      }
    })
  }

  /**
   * Gets sdktoken
   */
  getSDKToken() {
    const params = {
      applicant_id: this.applicantId
    }
    this.onfidoService.getSDKToken(params).subscribe({
      next: (res: any) => {
        this.sdkToken = res.data;

        if (this.sdkToken) {
          this.getWorkflowRunId(this.userId);
        }
      }
    })
  }

  /**
   * Gets workflow run id
   * @param id
   */
  getWorkflowRunId(id: string) {
    const params = {
      applicant_id: this.applicantId
    }
    this.onfidoService.getWorkflowRunId(id, params).subscribe({
      next: (res: any) => {
        this.workflowRunId = res.data.work_flow_run_id;

        if (this.workflowRunId) {
          this.initOnfido();
        }
      }
    })
  }

  initOnfido() {
    if (this.sdkToken && this.workflowRunId) {
      this.startOnfido();
    }
  }

  /**
   * Starts onfido
   */
  startOnfido() {
    Onfido.init({
      token: this.sdkToken,
      containerId: "onfido-mount",
      workflowRunId: this.workflowRunId,
      onComplete: (data) => {
        console.log("Documents uploaded Completed: ", data);
        this.toastr.success("Documents uploaded successfully! Please wait for verification.");
        this.documentUpload();
        this.localStorageService.storeData('docUploaded', true);
        this.router.navigate(['/home']);
      },
      onError: (error) => {
        console.error("Onfido Error:", error);
        this.toastr.error("KYC Verification Failed. Please try again.");
      }
    });
  }


  /**
   * Documents upload
   */
  documentUpload() {
    const params = {
      document_uploaded: true
    }
    this.profileService.profileUpdate(this.userId, params).subscribe({
      next: (res: any) => {
        console.log('Document uploaded api triggered!', res)
      }
    })
  }

}
