pipeline {
agent any

stages {

    stage('Checkout Code') {
        steps {
            checkout scm
        }
    }

    stage('Stop Existing Containers') {
        steps {
            sh 'docker-compose down || true'
        }
    }

    stage('Build Frontend & Backend') {
        steps {
            sh 'docker-compose build'
        }
    }

    stage('Deploy Frontend & Backend') {
        steps {
            sh 'docker-compose up -d'
        }
    }

    stage('Verify Deployment') {
        steps {
            sh 'docker ps'
        }
    }
}

post {
    success {
        echo 'Tracklify Frontend and Backend Deployed Successfully'
    }

    failure {
        echo 'Tracklify Deployment Failed'
    }
}

}
