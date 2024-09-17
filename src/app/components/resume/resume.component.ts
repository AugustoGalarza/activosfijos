import { Registry } from './../../models/registry';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfigService } from './../../services/config.service';
import {NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import { AssettypeService } from './../../services/assettype.service';
import { RegistryService } from './../../services/registry.service';
import { IRegistry } from './../../interfaces/iregistry';
import { Component, OnInit, ViewChild, TemplateRef, Input, Output, EventEmitter, Renderer2 } from '@angular/core';
import {QrScannerComponent} from 'angular2-qrscanner';
import { set, get, cloneDeep, forEach, sumBy, toNumber, orderBy, find } from 'lodash-es';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';
import * as XLSXStyle from 'xlsx-style';
import * as moment from 'moment';
import { IAgencia } from '../../interfaces/iagencia';
import { IActivofijo } from '../../interfaces/iactivofijo';
import { internalExists, quantityValid, invoiceExists, letterValid, zeroisnotValid } from '../../validators/validators';
import * as FileSaver from 'file-saver';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
import { AngularFireStorage, AngularFireUploadTask  } from '@angular/fire/storage';
import { Observable, Subscription } from 'rxjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DetailComponent } from './../../shared/components/detail/detail.component';
import { AngularFireDatabase } from 'angularfire2/database';
import { IEstado } from '../../interfaces/iestado';
import { Appointment } from '../../models/appointment.model';
import {NgForm} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import * as _ from 'lodash';
import { AngularFireAuth } from '@angular/fire/auth'
import { startWith } from 'rxjs/internal/operators/startWith';
import { IResponsable } from '../../interfaces/iresponsable';
@Component({
  selector: 'app-resume',
  templateUrl: './resume.component.html',
  styleUrls: ['./resume.component.css']
})

export class ResumeComponent implements OnInit {
  public readonly hideControl: FormControl;
  public readonly Borrar$: Observable<boolean>;
  cardShow: any = [true,true,true];
  @Input() public item?: any;

  uploadPercent$: Observable<number>;
  downloadUrl$: Observable<string>;
  model: NgbDateStruct;
  showMe: boolean= true;
  @Input() asignation:Registry;
  @Input() registrySelected: Registry;
  public scannerEnabled: boolean = true;
  public showDetail: boolean;
  private information: string = "No se ha detectado información de ningún código. Acerque un código QR para escanear.";
  public newUser:any;
  @ViewChild(QrScannerComponent) qrScannerComponent: QrScannerComponent ;
  @ViewChild("modal_confirm_delete", { static: false }) modal_confirm_delete: TemplateRef<any>;
  @ViewChild("modal_success", { static: false }) modal_success: TemplateRef<any>;
  @ViewChild("modal_error", { static: false }) modal_error: TemplateRef<any>;
  @ViewChild("modal_responsable", { static: false }) modal_responsable: TemplateRef<any>;
 
  @ViewChild("modal_asignation_success", { static: false }) modal_asignation_success: TemplateRef<any>;
  @ViewChild(DetailComponent, { static: false }) parentDetail: DetailComponent;
  @Input() typeRegistry: string;
  
  @Output() hide: EventEmitter<boolean>;
  @Output() close: EventEmitter<boolean>;
  @Input() listRegistries: Registry[];
  public selectedAsset: IActivofijo = { id: 0, name: '' };
  public selectedBranch: IAgencia = { id: 0, name: '' };
  public selectedEstado: IAgencia = { id: 0, name: '' };
  public atypes: IActivofijo[];
  public obranches: IAgencia[];
  public oestados: IEstado[];
  public oresponsables: IResponsable[];
  public admin: any;
  public store: any;
  public formRegistry: FormGroup;
  public formShow: FormGroup;
  public capturedqrimage:any;
  public listRegistriesOriginal: IRegistry[];
  public listRegistriesFiltered: IRegistry[];
  public showResume: boolean;
  public total: number;
  public totalDe:number;
  public page: number;
  public locale: any;
  public itemsRegistries: number;
  public deprecResult: number;
public fiscalCredit: number;

  url = '';
  private basePath1 = '/registries';
  public loadBranches:boolean;
  public cargarActivosfijos: boolean;
  storageRef: any;
  private basePath = '/backup';
  file: File;
  imagePost: AbstractControl;
  public listaActivosfijos: IActivofijo[];
  public listBranches: IAgencia[];
  public listEstados:IEstado[];
  public listResponsables: IResponsable[];
  public loadEstados:boolean;
  public loadResponsables: boolean;
  currentRegistry: Registry;
  public showAddTask: boolean;
public subscription : Subscription;

  constructor(
    private renderer:Renderer2,
    private afd: AngularFireDatabase,
    private formBuilder: FormBuilder,
    private rService: RegistryService,
    private aService: AssettypeService,
    private config: ConfigService,
    private modalService: NgbModal,
    private storage: AngularFireStorage,
    public atService: AuthService,
    private afAuth: AngularFireAuth,
   
  ) {
   

    this.newUser=this.afAuth.auth.currentUser.email;
    
    console.log(this.newUser)
    
    this.admin=atService.admin;
    console.log(this.admin)
    this.loadEstados= false;
    this.close = new EventEmitter<boolean>();
    this.listaActivosfijos = [];
    this.listBranches= [];
    this.listEstados=[];
    this.listResponsables=[];
    this.cargarActivosfijos = false;
    this.loadBranches = false;
    this.loadEstados = false;
    this.loadResponsables=false;
    // Obtengo el locale para los calendarios
    this.locale = this.config.locale;
    let disableBtn = false;
    this.listRegistriesOriginal = [];
    this.listRegistriesFiltered = [];
    this.showResume = false;
    this.total = 0;
    this.totalDe= 0;
    this.page = 1;
    // Obtengo el numero de registros de la configuracion
    this.itemsRegistries = this.config.itemsRegistriesPage;

    this.formShow = this.formBuilder.group({
      idActivofijo: new FormControl(this.aService.getAtypes),


    });


    }
   
    qrcodescanned = '';
    downloadableURL = '' ;
    task: AngularFireUploadTask;
    progressValue: Observable<number>;
    public convertToPDF() {
      var data = document.getElementById('tablaRegistros');
      
      if(data){
        html2canvas(data ,{useCORS : true}).then((canvas : any) => {
          
        
          
          // Few necessary setting options
          var imgWidth = 210;
          var pageHeight = 295;
          var imgHeight = canvas.height * imgWidth / canvas.width;
          var heightLeft = imgHeight;
          
         
          const contentDataURL = canvas.toDataURL('image/png')
          
          const pdf = new jsPDF('p', 'mm', [210 , 318]); // A4 size page of PDF
          var position = 25;
          const img1 = new Image()
          img1.src = 'assets/img/logo.png'
          pdf.addImage(img1, 'png', 2, 2, 20, 20);
          pdf.addImage(contentDataURL, "PNG",0, position, imgWidth, imgHeight-20);
          heightLeft -= pageHeight;



          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(img1, 'png', 2, 2, 20, 20);
            pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight-20);
            heightLeft -= pageHeight;
            }
            pdf.save( 'file.pdf');
   
 });
}
    }

   

  ngOnInit() {
    
    this.atypes = this.aService.getAtypes();
    

    // Obtengo los registros
    this.rService.getRegistries().subscribe(list => {
      // Ordeno las listas al reves y las clono
      this.listRegistriesOriginal = cloneDeep(orderBy(list, r => r.date).reverse());
      this.listRegistriesFiltered = cloneDeep(orderBy(list, r => r.date).reverse());
      this.listRegistriesFiltered = _.filter( this.listRegistriesFiltered , (r) => r.hideCard !== true);
      // Completo los activos
      this.completeActivosfijos();
      // Sumo el total de los registros
      this.sumTotal();
      this.sumDeprec();
      this.showResume = true;

    }, error => {
      console.error('Error al recoger los registros:' + error);

    })
    this.oresponsables =this.aService.getOresponsables();
    this.atypes = this.aService.getAtypes();
    this.oestados=this.aService.getOestados();
    this.obranches=this.aService.getObranches();
    // Si estoy editando
    if (this.registrySelected) {
      const d = new Date(this.registrySelected.date);
      d.setDate(d.getDate()+1);
    
      // Validamos la cantidad
      // Ponemos el id tambien para poder recogerlo despues
      this.formRegistry = this.formBuilder.group({
       
        date: new FormControl(new Date(d)),
        type: new FormControl(this.registrySelected.type),
        precio: new FormControl(this.registrySelected.precio),
        id: new FormControl(this.registrySelected.id),
        descripcion: new FormControl(this.registrySelected.descripcion),
        user: new FormControl(this.newUser),        
        catastralcode: new FormControl(this.registrySelected.catastralcode),
        ruat: new FormControl(this.registrySelected.ruat),
        internalcode: new FormControl(this.registrySelected.internalcode),
        depreciation: new FormControl(this.registrySelected.depreciation),
        ubicacion: new FormControl(this.registrySelected.ubicacion),
        responsable: new FormControl(this.registrySelected.responsable),
        licenseplate: new FormControl(this.registrySelected.licenseplate),
        typeofvehicle: new FormControl(this.registrySelected.typeofvehicle),
        marca: new FormControl(this.registrySelected.marca),
        color: new FormControl(this.registrySelected.color),
        chassis: new FormControl(this.registrySelected.cilindrada),
        model: new FormControl(this.registrySelected.model),
        agencia:new FormControl(this.registrySelected.agencia),
        idActivofijo: new FormControl(this.registrySelected.idActivofijo),
        invoice: new FormControl(this.registrySelected.invoice),
        proveedor: new FormControl(this.registrySelected.proveedor),
        fiscal: new FormControl(this.registrySelected.fiscal),
        authNumber: new FormControl(this.registrySelected.authNumber),
        imagePost:new FormControl(this.registrySelected.imagePost),
        qrcode:new FormControl(this.registrySelected.qrcode),
        estado:new FormControl(this.registrySelected.estado), 
        carnetdeidentidad: new FormControl(this.registrySelected.carnetdeidentidad)   
      });
      
    } else {
      // Nuevo registro
      // Validamos la cantidad
     
      this.formRegistry = this.formBuilder.group({
        user: new FormControl(''),
        date: new FormControl(new Date()),      
        type: new FormControl(this.typeRegistry),
        id:new FormControl(0),
        idActivofijo: new FormControl('',[Validators.required,letterValid]),
        descripcion: new FormControl(''),
        agencia: new FormControl('',[Validators.required,letterValid]),
        estado: new FormControl('',[Validators.required,letterValid]),
        precio: new FormControl('', [Validators.required, quantityValid]),
        catastralcode: new FormControl(''),
        ruat: new FormControl(''),      
        internalcode: new FormControl('', [quantityValid, internalExists(this.listRegistries), Validators.maxLength(4)]),
        depreciation: new FormControl('', [Validators.required, quantityValid]),
        ubicacion: new FormControl(''),
        responsable: new FormControl('', [Validators.required,letterValid]),
        licenseplate: new FormControl(''),
        typeofvehicle: new FormControl(''),
        marca: new FormControl(''),
        color: new FormControl(''),
        chassis: new FormControl(''),
        model: new FormControl(''),
        invoice: new FormControl('', [Validators.required, quantityValid, Validators.maxLength(9),invoiceExists(this.listRegistries)]),
        proveedor: new FormControl('',[Validators.required,letterValid]),
        fiscal: new FormControl('',[Validators.required, quantityValid]),
        authNumber: new FormControl('', [Validators.required, quantityValid, Validators.maxLength(15)]),
        imagePost:new FormControl('', Validators.required),
        qrcode:new FormControl(''),
        carnetdeidentidad: new FormControl('', [Validators.required,zeroisnotValid, internalExists(this.listRegistries), Validators.maxLength(7)])
      });
    };


    
    // Obtengo los activos
    this.aService.getActivofijo().subscribe(listaActivosfijos => {
      this.listaActivosfijos= listaActivosfijos;

      this.cargarActivosfijos = true;
    }, error => {
      console.error(error);
      this.cargarActivosfijos= true;
    });
    this.aService.getBranches().subscribe(listBranches => {
      this.listBranches = listBranches;

      this.loadBranches = true;
    }, error => {
      console.error(error);
      this.loadBranches = true;
    });
    this.aService.getResponsables().subscribe(listResponsables => {
      this.listResponsables = listResponsables;

      this.loadResponsables = true;
    }, error => {
      console.error(error);
      this.loadResponsables = true;
    });
    this.aService.getEstados().subscribe(listEstados => {
      this.listEstados = listEstados;
  
      this.loadEstados = true;
    }, error => {
      console.error(error);
      this.loadEstados = true;
    });
  }
  
  async onFileChanged(event) {
    const file = event.target.files[0];
    if (file) {
       const filePath = `${this.basePath1}/${file.name}`;
       this.task =  this.storage.upload(filePath, file);


       this.progressValue = this.task.percentageChanges();       // <<<<< Percentage of uploading is given


    (await this.task).ref.getDownloadURL().then(url => {this.downloadableURL = url; });

     } else {
       alert('No images selected');
       this.downloadableURL = ''; }

     }

  /**
   * Obtengo el formcontrol price
   */
  get precio() {
    return this.formRegistry.get('precio');

  }
  get carnetdeidentidad() {
    return this.formRegistry.get('carnetdeidentidad');

  }
/**
   * Obtengo el formcontrol internalcode
   */
  get internalcode() {
    return this.formRegistry.get('internalcode');
  }
  /**
   * Obtengo el formcontrol invoice
   */
  get invoice() {
    return this.formRegistry.get('invoice');
  }
  
  /**
   * Obtengo el formcontrol responsable
   */
  get responsable() {
    return this.formRegistry.get('responsable');
  }
/**
   * Obtengo el formcontrol depreciation
   */
  get depreciation() {
    return this.formRegistry.get('depreciation');
  }
  /**
   * Obtengo el formcontrol provider
   */
  get proveedor() {
    return this.formRegistry.get('proveedor');
  }
  get descripcion(){
    return this.formRegistry.get('descripcion');
  }
  /**
   * Obtengo el formcontrol type
   */
  get type() {
    return this.formRegistry.get('type');
  }
  /**
   * Obtengo el formcontrol idActivofijo
   */
  get idActivofijo() {
    return this.formRegistry.get('idActivofijo');
  }
  
  /**
   * Obtengo el formcontrol agencia
   */
  get agencia() {
    return this.formRegistry.get('agencia');
  }
  /**
   * Obtengo el formcontrol ubication
   */
  get ubicacion(){
    return this.formRegistry.get('ubicacion');
  }
/**
   * Obtengo el formcontrol date
   */
  get date(){
    return this.formRegistry.get('date');
  }
  /**
   * Obtengo el formcontrol fiscal
   */
  get fiscal(){
    return this.formRegistry.get('fiscal');
  }
  /**
   * Obtengo el formcontrol authNumber
   */
  get authNumber(){
    return this.formRegistry.get('authNumber');
  }

get estado(){
  return this.formRegistry.get('estado')
}
get user(){
  return this.formRegistry.get('user');
  
}
  /**
   * Cierro el detalle
   * @param $event Estado de la ventana
   */
  closeDetail($event) {
    this.close.emit($event);
  console.log($event)

  }
  
 /**
   * Elimino un registro
   * @param registry Registro a eliminar
   */
  removeRegistry(registry: Registry) {

    registry.hideCard = true;
   
  } 
  
  onPageChange(page:number){
    
  	this.page = page;
  }

  

  /**
   * Completa los activos de los posts
   */
  completeActivosfijos() {
    // Obtengo todas las activos
    this.aService.getActivofijo().subscribe(assettypes => {
      // Recorro la lista de registros
      forEach(this.listRegistriesFiltered, r => {
        // Busco el activo
        const assettype = find(assettypes, c => c.id === r.idActivofijo);
        // Si esta lo asocio
        if (assettype) {
          r.assettype = assettype;
        }
      });
      // Clono de nuevo para actualizar el estado de la lista
      this.listRegistriesOriginal = cloneDeep(this.listRegistriesFiltered);
    }, error => {
      console.error('Error al recoger los activos fijos:' + error);

    })
  }
          // <<<<< Percentage of uploading is given

  /**
   * Obtenga la suma total de los registros
   */
  sumTotal() {
    this.total = sumBy(this.listRegistriesFiltered, r => {
      // Convierto la cantidad a numero
      let precio = toNumber(r.precio);
      // Si es un gasto, multiplico por -1
      if (r.type === 'expense') {
        precio = precio * 1;
      }
      return precio
    })
  }
  sumDeprec() {
    this.totalDe = sumBy(this.listRegistriesFiltered, r => {
      // Convierto la cantidad a numero
      let depreciation = toNumber(r.depreciation);
      // Si es un gasto, multiplico por -1
      if (depreciation ==0) {
        depreciation= depreciation*1;
      }
      return depreciation
    })
  }

  
  Assignation(){
    let registry = new Registry(this.registrySelected);
    registry.responsable = this.formRegistry.value.responsable;
      this.rService.editRegistry(registry).then(() => {
        this.modalService.open(this.modal_asignation_success).result.then(() => {         
          this.parentDetail.closeDetail()       
        })
        
      }, 
      (error) => {
        console.error(error);
      });
   }
  
  errorMessage = "";
  
  addBackup() {

      // Devuelvo una promesa
    
    this.rService.getRegistries().subscribe(list => {
      // Ordeno las listas al reves y las clono
      
      this.listRegistriesFiltered = cloneDeep(orderBy(list, r => r.date).reverse());

      
      
      
    let backup = new Registry(this.listRegistriesFiltered);
    
      
      
      this.rService.addBackup(backup).then(() => {
        this.modalService.open(this.modal_success).result.then(() => {
          this.parentDetail.closeDetail()
          this.errorMessage = ""
        })
        
        
    
      
      }, error => {
        if(error && error.message && error.message.includes('PERMISSION_DENIED')){
          this.errorMessage = 'User do not have permission'
        }else{
          this.errorMessage = "Usuario no autorizado";
        }
        this.modalService.open(this.modal_error);
        
      })  
    })
  }
 
  addRegistry() {
 
    let registry = new Registry(this.registrySelected);
    
    registry.responsable = this.formRegistry.value.responsable;
      this.rService.editRegistry(registry).then(() => {
        this.modalService.open(this.modal_success).result.then(() => {         
          this.parentDetail.closeDetail()       
        })
        
      }, 
      (error) => {
        console.error(error);
      });
 }
  /**
   * Manda el registro a la cabecera para que lo abra
   * @param registry Registro a mandar
   */
  openEditDetail(registry: Registry) {
    
    this.registrySelected = registry;  
    this.rService.selectRegistry(registry);  
    
    
      
      
    
  }
  openAsignationDetail(registry: Registry) { 
    
    this.modalService.open(this.modal_responsable);
    this.registrySelected = registry;
  }
  calcFiscal(){
    let creditCal:number;
    
    let precio= parseInt(this.precio.value);
    creditCal= precio * 0.13;
    this.fiscalCredit = creditCal;

  }
  dataReset(){
    this.formRegistry.reset('ubication');
  }
  
  
  closeDetailres($event) {
    this.showDetail = $event;
    this.registrySelected = null;
  }
   
   
  
  
   
  /////////////

  
  depreciate() {
    let todayDate = moment();
    let newDate = moment(this.date.value);
    let resultDep: any;
    let precio = parseInt(this.precio.value);
    let Calculator: any = '';
    let credFisc :any;
    let depHist :any ;
    let depActual :any ;
    let totMonths :any ;
    let monthCons :any ;
    let actIncome :any ;

     resultDep = newDate.diff(todayDate, 'months');
     // getting the value
     const selectedActivoFijo = this.formRegistry.get('idActivofijo').value;
    
  
    if (selectedActivoFijo == 'Terrenos') {
      Calculator = '';

    }
    if(selectedActivoFijo === 'Edificaciones'){
      // logic
      credFisc = precio * 0.13;
      depHist = precio - credFisc;
      const inUfv : any= 2.33187;
      const finUfv :any= 2.35998;
      totMonths = 40*12;
      monthCons = Math.abs(resultDep);
      actIncome = totMonths - monthCons;
      depActual = depHist * finUfv/inUfv
      Calculator = (depActual / totMonths) * monthCons;

    }
    if(selectedActivoFijo === 'Muebles y enseres'){
      // logic
      credFisc = precio * 0.13;
      depHist = precio - credFisc;
      const inUfv : any= 2.33187;
      const finUfv :any= 2.35998;
      totMonths = 10*12;
      monthCons = Math.abs(resultDep);
      actIncome = totMonths - monthCons;
      depActual = depHist * finUfv/inUfv
      Calculator = (depActual / totMonths) * monthCons;
    }
      if (selectedActivoFijo === 'Maquinaria') {
        credFisc = precio * 0.13;
        depHist = precio - credFisc;
        const inUfv : any= 2.33187;
        const finUfv :any= 2.35998;
        totMonths = 8*12;
        monthCons = Math.abs(resultDep);
        actIncome = totMonths - monthCons;
        depActual = depHist * finUfv/inUfv
        Calculator = (depActual / totMonths) * monthCons;
  
      }
      if (selectedActivoFijo === 'Equipos e Instalaciones') {
        credFisc = precio * 0.13;
        depHist = precio - credFisc;
        const inUfv : any= 2.33187;
        const finUfv :any= 2.35998;
        totMonths = 8*12;
        monthCons = Math.abs(resultDep);
        actIncome = totMonths - monthCons;
        depActual = depHist * finUfv/inUfv
        Calculator = (depActual / totMonths) * monthCons;
  
      }
      if (selectedActivoFijo === 'Vehículos') {
        credFisc = precio * 0.13;
        depHist = precio - credFisc;
        const inUfv : any= 2.33187;
        const finUfv :any= 2.35998;
        totMonths = 5*12;
        monthCons = Math.abs(resultDep);
        actIncome = totMonths - monthCons;
        depActual = depHist * finUfv/inUfv
        Calculator = (depActual / totMonths) * monthCons;
  
      }
      if (selectedActivoFijo === 'Equipos de computación') {
        credFisc = precio * 0.13;
        depHist = precio - credFisc;
        const inUfv : any= 2.33187;
        const finUfv :any= 2.35998;
        totMonths = 4*12;
        monthCons = Math.abs(resultDep);
        actIncome = totMonths - monthCons;
        depActual = depHist * finUfv/inUfv
        Calculator = (depActual / totMonths) * monthCons;
      }
    
    
    this.deprecResult = Calculator ;


  }
  
  public capturedqr(){
    this.capturedqrimage=this.registrySelected.qrcode
   
  }
  /**
   * Devuelve el resultado del filtro
   * @param $event Lista de registros filtrados
   */
  filter($event) {
    this.listRegistriesFiltered = $event;
    this.page = 1;
    // Calculo el total de nuevo
    this.sumTotal();
  }

  exportexcel(json:any[],excelFileName: string): void
  {
     /* table id is passed over here */

     const ws: XLSX.WorkSheet =XLSX.utils.json_to_sheet(this.listRegistriesFiltered);
     const workbook: XLSX.WorkBook = { Sheets: { 'registry': ws }, SheetNames: ['registry']};
     this.wrapAndCenterCell(ws.B2);
     
     const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
     this.saveAsExcelFile(excelBuffer, excelFileName);
  }
     /* generate workbook and add the worksheet */
     private wrapAndCenterCell(cell: XLSX.CellObject) {
      const wrapAndCenterCellStyle = { alignment: { type: 'binary' ,bookSST:true, wrapText: true, vertical: 'center', horizontal: 'center' } };
      this.setCellStyle(cell, wrapAndCenterCellStyle);
    }
  
    private setCellStyle(cell: XLSX.CellObject, style: {}) {
      cell.s = style;
    
  }
     private saveAsExcelFile(buffer: any, fileName="Activos Fijos"): void {
      const data: Blob = new Blob([buffer], {type: EXCEL_TYPE});
      FileSaver.saveAs(data, fileName + '_export_' + new  Date().getTime() + EXCEL_EXTENSION);
   }

   public scanSuccessHandler($event: any) {
   
    if(this.registrySelected){
      this.scannerEnabled = false;
      this.information = "Espera recuperando información... ";
  
      const appointment = new Appointment($event);
      this.qrcodescanned = appointment.identifier;
      
      this.formRegistry.patchValue({
        qrcodescanned:this.capturedqrimage
      })
      console.log(this.registrySelected.qrcode)
      }
      else{
        this.scannerEnabled = false;
      this.information = "Espera recuperando información... ";
      
      const appointment = new Appointment($event);
      this.qrcodescanned = appointment.identifier;
      
      }
  }
  
  public enableScanner() {
    this.scannerEnabled = true;
    this.registrySelected.qrcode=''

  }
}
interface Transport {
  plates: string;
  slot: Slot;

}
interface Slot {
  name: string;
  description: string;


}
  

