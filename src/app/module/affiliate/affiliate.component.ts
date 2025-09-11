import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { LocalStorageService } from 'src/app/services/local-storage.service';

@Component({
  selector: 'app-affiliate',
  standalone: true,
  imports: [],
  templateUrl: './affiliate.component.html',
  styleUrl: './affiliate.component.scss'
})
export class AffiliateComponent implements OnInit {

  constructor(private localStotageService: LocalStorageService,
     private router: Router,
     private route: ActivatedRoute,
     private spinner: NgxSpinnerService, 
  ) {}

  ngOnInit(): void {
    this.spinner.show();
    this.route.paramMap.subscribe(params => {
      const affiliateId = params.get('id');
      this.localStotageService.storeData('affiliateCode', affiliateId);
    });
    this.spinner.hide();
    this.router.navigate(['/login']);
  }

}
