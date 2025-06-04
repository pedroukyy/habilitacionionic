import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectFormPage } from './project-form.page';

describe('ProjectFormPage', () => {
  let component: ProjectFormPage;
  let fixture: ComponentFixture<ProjectFormPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
