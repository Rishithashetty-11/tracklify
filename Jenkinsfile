pipeline {
    agent any

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh 'docker build -t siramshettyrishitha/tracklify-frontend:v1 ./frontend'
            }
        }

        stage('Build Backend Image') {
            steps {
                sh 'docker build -t siramshettyrishitha/tracklify-backend:v1 ./backend'
            }
        }
        stage('Trivy Scan - Backend') {
           steps {
               sh 'trivy image siramshettyrishitha/tracklify-backend:v1'
         }
       }

       stage('Trivy Scan - Frontend') {
         steps {
              sh 'trivy image siramshettyrishitha/tracklify-frontend:v1'
       }
     }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    '''
                }
            }
        }

        stage('Push Frontend Image') {
            steps {
                sh 'docker push siramshettyrishitha/tracklify-frontend:v1'
            }
        }

        stage('Push Backend Image') {
            steps {
                sh 'docker push siramshettyrishitha/tracklify-backend:v1'
            }
        }

        stage('Deploy To Kubernetes') {
            steps {
                sh '''
                    ssh -o StrictHostKeyChecking=no root@3.101.57.161 "
                        cd ~/tracklify/k8s &&
                        kubectl apply -f . &&
                        kubectl rollout restart deployment tracklify-frontend &&
                        kubectl rollout restart deployment tracklify-backend &&
                        kubectl rollout status deployment/tracklify-frontend &&
                        kubectl rollout status deployment/tracklify-backend &&
                        kubectl get pods &&
                        kubectl get svc
                    "
                '''
            }
        }
    }

    post {
        success {
            echo 'Tracklify deployed successfully to Kubernetes!'
        }

        failure {
            echo 'Tracklify deployment failed.'
        }
    }
}
