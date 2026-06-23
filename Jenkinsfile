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
            ssh -o StrictHostKeyChecking=no root@52.53.195.198 "
            kubectl rollout restart deployment tracklify-frontend
            kubectl rollout restart deployment tracklify-backend
            "
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
