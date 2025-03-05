import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ContactDetails {
  name: string;
  designation: string;
  email: string;
  phoneNumber: string;
}

interface SecurityControl {
  key: keyof SecurityControls;
  label: string;
}

interface SecurityControls {
  nextGenFirewall: boolean;
  ipsIds: boolean;
  proxySolution: boolean;
  dnsSecurity: boolean;
  emailSecurity: boolean;
  waf: boolean;
  zeroTrust: boolean;
  networkAccessControl: boolean;
  threatIntel: boolean;
  darkWebMonitoring: boolean;
  attackSurfaceMonitoring: boolean;
  pimPam: boolean;
  dam: boolean;
  browserSecurity: boolean;
  itsm: boolean;
  otFirewall: boolean;
  networkSituationalAwareness: boolean;
}

interface FormData {
  // Governance Section
  organizationName: string;
  industrySector: string;
  primaryContact: ContactDetails;
  secondaryContact: ContactDetails;
  regulatoryFrameworks: {
    rbi: boolean;
    sebi: boolean;
    hipaa: boolean;
    dpdp: boolean;
    gdpr: boolean;
    certIn: boolean;
    iso: boolean;
    nist: boolean;
    irdai: boolean;
  };
  irp: string;
  irpFile: File | null;
  bcpDrp: string;
  bcpDrpFile: File | null;
  breachNotification: string;

  // Incident & Crisis Management Section
  dataClassification: string;
  dataClassificationFile: File | null;
  backups: string;
  pentesting: string;
  cloudInfra: string;
  vendorAccess: string;

  // Tech Defence Measures Section
  irt: 'inhouse' | 'outsourced' | 'no' | '';
  securityTraining: string;
  soc: string;
  securityControls: SecurityControls;
  cyberInsurance: string;
  cyberInsuranceFile: File | null;

  // Policy Section
  policies: {
    dataClassification: boolean;
    accessControl: boolean;
    networkSecurity: boolean;
    hrSecurity: boolean;
    threatVulnerability: boolean;
    supplierSecurity: boolean;
  };
  policyFiles: {
    dataClassification: File | null;
    accessControl: File | null;
    networkSecurity: File | null;
    hrSecurity: File | null;
    threatVulnerability: File | null;
    supplierSecurity: File | null;
  };
  
  drSite: 'hotSite' | 'warmSite' | 'coldSite' | 'none';
  cloudInfrastructure: 'yes' | 'partial' | 'onPrem';
  vendorAccessControl: 'wellDefined' | 'adhoc' | 'no';

  // Exercise Types
  exerciseTypes: {
    phishing: boolean;
    businessEmailCompromise: boolean;
    ceoFraud: boolean;
    ddos: boolean;
    insiderThreat: boolean;
    applicationCompromise: boolean;
    cyberEspionage: boolean;
    dataBreach: boolean;
  };

  exerciseFormat: string;
  exerciseObjective: string;
  additionalComments: string;

  // Approval Section
  participationAgreement: boolean;
  termsAgreement: boolean;
  signature: string;
  date: string;
}

@Component({
  selector: 'app-pre-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pre-onboarding.component.html',
  styleUrls: ['./pre-onboarding.component.css']
})
export class PreOnboardingComponent {
  securityControlsList: SecurityControl[] = [
    { key: 'nextGenFirewall', label: 'Next Gen Firewalls' },
    { key: 'ipsIds', label: 'IPS/IDS' },
    { key: 'proxySolution', label: 'Proxy Solution' },
    { key: 'dnsSecurity', label: 'DNS Security' },
    { key: 'emailSecurity', label: 'Email Security' },
    { key: 'waf', label: 'WAF' },
    { key: 'zeroTrust', label: 'Zero Trust Network Architecture' },
    { key: 'networkAccessControl', label: 'Network Access Control' },
    { key: 'threatIntel', label: 'Threat Intel' },
    { key: 'darkWebMonitoring', label: 'Dark Web Monitoring' },
    { key: 'attackSurfaceMonitoring', label: 'Attack Surface Monitoring' },
    { key: 'pimPam', label: 'PIM/PAM' },
    { key: 'dam', label: 'DAM' },
    { key: 'browserSecurity', label: 'Browser Security' },
    { key: 'itsm', label: 'ITSM' },
    { key: 'otFirewall', label: 'OT Firewall' },
    { key: 'networkSituationalAwareness', label: 'Network Situational Awareness (OT NSA)' }
  ];

  formData: FormData = {
    organizationName: '',
    industrySector: '',
    primaryContact: {
      name: '',
      designation: '',
      email: '',
      phoneNumber: ''
    },
    secondaryContact: {
      name: '',
      designation: '',
      email: '',
      phoneNumber: ''
    },
    regulatoryFrameworks: {
      rbi: false,
      sebi: false,
      hipaa: false,
      dpdp: false,
      gdpr: false,
      certIn: false,
      iso: false,
      nist: false,
      irdai: false
    },
    irp: '',
    irpFile: null,
    bcpDrp: '',
    bcpDrpFile: null,
    breachNotification: '',
    dataClassification: '',
    dataClassificationFile: null,
    backups: '',
    pentesting: '',
    cloudInfra: '',
    vendorAccess: '',
    irt: '',
    securityTraining: '',
    soc: '',
    securityControls: {
      nextGenFirewall: false,
      ipsIds: false,
      proxySolution: false,
      dnsSecurity: false,
      emailSecurity: false,
      waf: false,
      zeroTrust: false,
      networkAccessControl: false,
      threatIntel: false,
      darkWebMonitoring: false,
      attackSurfaceMonitoring: false,
      pimPam: false,
      dam: false,
      browserSecurity: false,
      itsm: false,
      otFirewall: false,
      networkSituationalAwareness: false
    },
    cyberInsurance: '',
    cyberInsuranceFile: null,
    policies: {
      dataClassification: false,
      accessControl: false,
      networkSecurity: false,
      hrSecurity: false,
      threatVulnerability: false,
      supplierSecurity: false
    },
    policyFiles: {
      dataClassification: null,
      accessControl: null,
      networkSecurity: null,
      hrSecurity: null,
      threatVulnerability: null,
      supplierSecurity: null
    },
    drSite: 'none',
    cloudInfrastructure: 'onPrem',
    vendorAccessControl: 'no',
    exerciseTypes: {
      phishing: false,
      businessEmailCompromise: false,
      ceoFraud: false,
      ddos: false,
      insiderThreat: false,
      applicationCompromise: false,
      cyberEspionage: false,
      dataBreach: false
    },
    exerciseFormat: '',
    exerciseObjective: '',
    additionalComments: '',
    participationAgreement: false,
    termsAgreement: false,
    signature: '',
    date: ''
  };

  industrySectors = [
    'BFSI',
    'Healthcare',
    'Government',
    'IT/Tech',
    'Manufacturing',
    'Others'
  ];

  onSubmit() {
    console.log('Form submitted:', this.formData);
    // Add your form submission logic here
  }

  handleFileUpload(event: Event, field: string) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      if (field.startsWith('policy_')) {
        const policyKey = field.replace('policy_', '') as keyof typeof this.formData.policyFiles;
        this.formData.policyFiles[policyKey] = input.files[0];
      } else {
        const formField = field as keyof Pick<FormData, 'irpFile' | 'bcpDrpFile' | 'cyberInsuranceFile' | 'dataClassificationFile'>;
        this.formData[formField] = input.files[0];
      }
    }
  }

  getPolicyFileName(policyKey: keyof typeof this.formData.policyFiles): string {
    const file = this.formData.policyFiles[policyKey];
    return file ? file.name : 'No file chosen';
  }
}