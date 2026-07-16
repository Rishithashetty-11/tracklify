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
        echo "===== DEBUG ====="
        whoami
        echo "HOME=$HOME"

        pwd

        ls -la /var/lib/jenkins
        ls -la /var/lib/jenkins/.ssh

        ssh -vvv -o StrictHostKeyChecking=no root@18.144.205.126 "hostname"
        '''
    }
  }
}

    post {
        success {
            echo 'Tracklify deployed successfully to Kubernetes'
        }

        failure {
            echo 'Tracklify deployment failed'
        }
    }
}
